import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const UPLOAD_DIR = path.resolve(__dirname, '..', 'data', 'uploads')

let mode = 'local'
let s3 = null
let bucket = null

function r2Configured() {
  return (
    process.env.R2_ACCOUNT_ID &&
    process.env.R2_ACCESS_KEY_ID &&
    process.env.R2_SECRET_ACCESS_KEY &&
    process.env.R2_BUCKET
  )
}

/**
 * Inizializza lo storage dei file video.
 * - Se le variabili R2_* sono impostate → Cloudflare R2 (persistente, 10 GB gratis).
 * - Altrimenti → disco locale data/uploads (per sviluppo/self-host).
 */
export async function initStorage() {
  if (r2Configured()) {
    const { S3Client } = await import('@aws-sdk/client-s3')
    s3 = new S3Client({
      region: 'auto',
      endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
      },
    })
    bucket = process.env.R2_BUCKET
    mode = 'r2'
    console.log(`[CatAlive] Storage: Cloudflare R2 (bucket "${bucket}").`)
  } else {
    if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true })
    mode = 'local'
    console.log('[CatAlive] Storage: disco locale data/uploads.')
  }
}

export function storageMode() {
  return mode
}

// Le chiavi sono generate dal server, ma validiamo comunque per difesa in profondità:
// solo caratteri sicuri e nessun segmento "..".
function assertSafeKey(key) {
  if (typeof key !== 'string' || !/^[A-Za-z0-9/_.-]+$/.test(key) || key.split('/').includes('..')) {
    throw new Error('Chiave storage non valida')
  }
}

export function localPath(key) {
  assertSafeKey(key)
  const full = path.resolve(UPLOAD_DIR, key)
  if (full !== UPLOAD_DIR && !full.startsWith(UPLOAD_DIR + path.sep)) {
    throw new Error('Percorso fuori dalla cartella consentita')
  }
  return full
}

// Sposta un file temporaneo nello storage definitivo, con la chiave indicata.
export async function putFile(key, tmpFilePath, contentType) {
  assertSafeKey(key)
  if (mode === 'r2') {
    const { Upload } = await import('@aws-sdk/lib-storage')
    const upload = new Upload({
      client: s3,
      params: {
        Bucket: bucket,
        Key: key,
        Body: fs.createReadStream(tmpFilePath),
        ContentType: contentType || 'application/octet-stream',
      },
    })
    await upload.done()
    fs.unlink(tmpFilePath, () => {})
  } else {
    const dest = localPath(key)
    fs.mkdirSync(path.dirname(dest), { recursive: true })
    fs.renameSync(tmpFilePath, dest)
  }
}

// URL temporaneo firmato per leggere il file da R2 (lo streaming/seek lo fa R2).
export async function presignGet(key) {
  const { GetObjectCommand } = await import('@aws-sdk/client-s3')
  const { getSignedUrl } = await import('@aws-sdk/s3-request-presigner')
  return getSignedUrl(s3, new GetObjectCommand({ Bucket: bucket, Key: key }), { expiresIn: 3600 })
}

export async function deleteFile(key) {
  if (mode === 'r2') {
    const { DeleteObjectCommand } = await import('@aws-sdk/client-s3')
    try {
      await s3.send(new DeleteObjectCommand({ Bucket: bucket, Key: key }))
    } catch {
      /* ignora */
    }
  } else {
    try {
      fs.unlinkSync(localPath(key))
    } catch {
      /* ignora */
    }
  }
}
