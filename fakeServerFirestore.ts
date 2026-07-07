import { queryCollection, getDocLocal, setDocLocal, updateDocLocal, deleteDocLocal, LocalQueryFilter } from "./utils/dbFileStore.js";
import { createClient } from "@supabase/supabase-js";
import { initializeApp } from "firebase/app";
import {
  getFirestore as getFS,
  collection as fsCollection,
  doc as fsDoc,
  query as fsQuery,
  where as fsWhere,
  getDoc as fsGetDoc,
  getDocs as fsGetDocs,
  setDoc as fsSetDoc,
  updateDoc as fsUpdateDoc,
  deleteDoc as fsDeleteDoc
} from "firebase/firestore";
import fs from "fs";
import path from "path";

// 1. Initialize Supabase
const FALLBACK_URL = "https://tyqjnfoiooujylzijwtb.supabase.co";
const FALLBACK_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR5cWpuZm9pb291anlsemlqd3RiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzEwODUyOCwiZXhwIjoyMDkyNjg0NTI4fQ.idChwwk9yPaZtb1pCik3QmNXc2WcD1xTJu0GQtiBEhM";

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || FALLBACK_URL;
const supabaseKey = process.env.VITE_SUPABASE_KEY || process.env.SUPABASE_KEY || FALLBACK_KEY;

export const supabase = (supabaseUrl && supabaseKey) 
    ? createClient(supabaseUrl, supabaseKey) 
    : null;

export const TABLE_WHITELIST = ["user_accounts", "user_subscriptions_v3", "bugs"];
export function isTableAllowed(colName: string): boolean {
  if (!colName) return false;
  return TABLE_WHITELIST.includes(colName.trim().toLowerCase());
}

// 2. Load Firebase Configuration & Initialize Real Firestore Instance on Server
let firebaseConfig: any = null;
try {
  const configPath = path.join(process.cwd(), "firebase-applet-config.json");
  if (fs.existsSync(configPath)) {
    firebaseConfig = JSON.parse(fs.readFileSync(configPath, "utf8"));
  }
} catch (e) {
  console.error("[fakeServerFirestore] Failed to read firebase-applet-config.json:", e);
}

const firebaseApp = firebaseConfig ? initializeApp(firebaseConfig) : null;
export const db = (firebaseApp && firebaseConfig) ? getFS(firebaseApp, firebaseConfig.firestoreDatabaseId) : null;

export const getFirestore = (...args: any[]) => ({});
export const initializeFirestore = (...args: any[]) => ({});

// Mock path builders for routing
export function collection(db: any, path: string) { return { path }; }
export function doc(db: any, path: string, id: string) { return { path, id }; }
export function query(col: any, ...filters: any[]) { return { col, filters }; }
export function where(field: string, op: string, value: any) { return { field, op, value }; }
export function serverTimestamp() { return new Date().toISOString(); }

// 3. Real-Firestore-First Document Operations with Graceful Fallbacks

export async function originalGetDoc(ref: any) {
  const col = ref.path;
  const id = ref.id;

  // Try real Firestore first
  if (db) {
    try {
      const docRef = fsDoc(db, col, id);
      const docSnap = await fsGetDoc(docRef);
      if (docSnap.exists()) {
        const docData = docSnap.data();
        return {
          exists: () => true,
          data: () => docData,
          id: docSnap.id,
          ref
        };
      }
    } catch (err: any) {
      console.warn(`[Firestore Server originalGetDoc] failed for "${col}/${id}":`, err.message);
    }
  }

  // Fallback: Supabase
  try {
    if (supabase && isTableAllowed(col)) {
      const { data, error } = await supabase.from(col).select("*").eq("id", id).single();
      if (!error && data) {
        const unpacked = data.data && typeof data.data === "object" && !Array.isArray(data.data)
          ? { id, ...data.data }
          : data;
        return { exists: () => true, data: () => unpacked, id, ref };
      }
    }
  } catch (err) {
    console.warn(`[Supabase Server getDoc] failed for "${col}/${id}":`, err);
  }

  // Fallback: LocalDB
  const data = await getDocLocal(col, id);
  return { exists: () => !!data, data: () => data, id, ref };
}

export async function originalGetDocs(q: any) {
  let colName = q.path;
  let filters: LocalQueryFilter[] = [];
  if (q.col) {
    colName = q.col.path;
    filters = q.filters || [];
  }

  // Try real Firestore first
  if (db) {
    try {
      let queryRef: any = fsCollection(db, colName);
      const constraints = [];
      for (const f of filters) {
        constraints.push(fsWhere(f.field, f.op as any, f.value));
      }
      if (constraints.length > 0) {
        queryRef = fsQuery(queryRef, ...constraints);
      }
      const snap = await fsGetDocs(queryRef);
      const parsedDocs = snap.docs.map(docSnap => ({
        data: () => docSnap.data(),
        id: docSnap.id,
        exists: () => docSnap.exists(),
        ref: { path: colName, id: docSnap.id }
      }));
      return {
        empty: snap.empty,
        size: snap.size,
        docs: parsedDocs
      };
    } catch (err: any) {
      console.warn(`[Firestore Server originalGetDocs] failed for "${colName}":`, err.message);
    }
  }

  // Fallback: Supabase
  try {
    if (supabase && isTableAllowed(colName)) {
      let qBuilder = supabase.from(colName).select("*");
      for (const f of filters) {
        if (f.op === "==" || f.op === "===") {
          qBuilder = qBuilder.eq(f.field, f.value);
        } else if (f.op === "!=") {
          qBuilder = qBuilder.neq(f.field, f.value);
        } else if (f.op === ">") {
          qBuilder = qBuilder.gt(f.field, f.value);
        } else if (f.op === "<") {
          qBuilder = qBuilder.lt(f.field, f.value);
        }
      }

      const { data, error } = await qBuilder;
      if (!error && data) {
        const parsedDocs = data.map((row: any) => {
          const unpacked = row.data && typeof row.data === "object" && !Array.isArray(row.data)
            ? { id: row.id, ...row.data }
            : row;
          return {
            data: () => unpacked,
            id: row.id || unpacked?.id || "unknown",
            exists: () => true,
            ref: { path: colName, id: row.id || unpacked?.id || "unknown" }
          };
        });

        return {
          empty: parsedDocs.length === 0,
          size: parsedDocs.length,
          docs: parsedDocs
        };
      }
    }
  } catch (err) {
    console.warn(`[Supabase Server getDocs] failed for "${colName}":`, err);
  }

  // Fallback: LocalDB
  const data = await queryCollection(colName, filters);
  return {
    empty: data.length === 0,
    size: data.length,
    docs: data.map((d: any) => ({ data: () => d, id: d.id, exists: () => true, ref: { path: colName, id: d.id } }))
  };
}

export async function originalSetDoc(ref: any, data: any, options?: any) {
  const col = ref.path;
  const id = ref.id;

  // Always write locally (immediate backend consistency)
  await setDocLocal(col, id, data);

  // Try real Firestore
  if (db) {
    try {
      const docRef = fsDoc(db, col, id);
      if (options) {
        await fsSetDoc(docRef, data, options);
      } else {
        await fsSetDoc(docRef, data);
      }
      console.log(`[Firestore Server originalSetDoc] Successfully set doc "${col}/${id}"`);
    } catch (err: any) {
      console.warn(`[Firestore Server originalSetDoc] failed for "${col}/${id}":`, err.message);
    }
  }

  // Try Supabase
  try {
    if (supabase && isTableAllowed(col)) {
      const payload: any = { id };
      try {
        const { data: cols } = await supabase.from(col).select("*").limit(1);
        const hasDataCol = cols && cols.length > 0 && ("data" in cols[0]);
        if (hasDataCol) {
          payload.data = data;
        } else {
          Object.assign(payload, data);
        }
      } catch (colErr) {
        Object.assign(payload, data);
      }
      const { error } = await supabase.from(col).upsert(payload);
      if (error) {
        console.warn(`[Supabase Server setDoc] upsert returned error for "${col}/${id}":`, error.message);
      }
    }
  } catch (err: any) {
    console.warn(`[Supabase Server setDoc] failed for "${col}/${id}":`, err.message);
  }
}

export async function originalUpdateDoc(ref: any, data: any) {
  const col = ref.path;
  const id = ref.id;

  // Always write locally
  await updateDocLocal(col, id, data);

  // Try real Firestore
  if (db) {
    try {
      const docRef = fsDoc(db, col, id);
      await fsUpdateDoc(docRef, data);
      console.log(`[Firestore Server originalUpdateDoc] Successfully updated doc "${col}/${id}"`);
    } catch (err: any) {
      console.warn(`[Firestore Server originalUpdateDoc] failed for "${col}/${id}":`, err.message);
    }
  }

  // Try Supabase
  try {
    if (supabase && isTableAllowed(col)) {
      const { data: existingRows } = await supabase.from(col).select("*").eq("id", id).limit(1);
      if (existingRows && existingRows.length > 0) {
        const row = existingRows[0];
        if ("data" in row) {
          const mergedData = { ...(row.data || {}), ...data };
          await supabase.from(col).update({ data: mergedData }).eq("id", id);
        } else {
          await supabase.from(col).update(data).eq("id", id);
        }
      } else {
        await supabase.from(col).update(data).eq("id", id);
      }
    }
  } catch (err: any) {
    console.warn(`[Supabase Server updateDoc] failed for "${col}/${id}":`, err.message);
  }
}

export async function originalDeleteDoc(ref: any) {
  const col = ref.path;
  const id = ref.id;

  // Always delete locally
  await deleteDocLocal(col, id);

  // Try real Firestore
  if (db) {
    try {
      const docRef = fsDoc(db, col, id);
      await fsDeleteDoc(docRef);
      console.log(`[Firestore Server originalDeleteDoc] Successfully deleted doc "${col}/${id}"`);
    } catch (err: any) {
      console.warn(`[Firestore Server originalDeleteDoc] failed for "${col}/${id}":`, err.message);
    }
  }

  // Try Supabase
  try {
    if (supabase && isTableAllowed(col)) {
      await supabase.from(col).delete().eq("id", id);
    }
  } catch (err: any) {
    console.warn(`[Supabase Server deleteDoc] failed for "${col}/${id}":`, err.message);
  }
}
