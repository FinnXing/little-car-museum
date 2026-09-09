import { createHash, createHmac } from "node:crypto";
import { mkdir, readFile, unlink, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";

export interface PutObjectInput {
  key: string;
  body: Uint8Array;
  contentType: string;
}

export interface ObjectStorage {
  putObject(input: PutObjectInput): Promise<void>;
  getObject(key: string): Promise<Uint8Array>;
  deleteObject(key: string): Promise<void>;
  publicUrl(key: string): string | null;
}

function encodePath(value: string) {
  return value.split("/").map(encodeURIComponent).join("/");
}

function sha256(value: Uint8Array | string) {
  return createHash("sha256").update(value).digest("hex");
}

class LocalObjectStorage implements ObjectStorage {
  private readonly root = resolve(
    process.env.STORAGE_LOCAL_ROOT || join(process.cwd(), ".local/objects"),
  );

  private pathFor(key: string) {
    const path = resolve(this.root, key);
    if (!path.startsWith(`${this.root}/`))
      throw new Error("Invalid object key");
    return path;
  }

  async putObject({ key, body }: PutObjectInput) {
    const path = this.pathFor(key);
    await mkdir(dirname(path), { recursive: true });
    await writeFile(path, body, { flag: "wx", mode: 0o600 });
  }

  async getObject(key: string) {
    return new Uint8Array(await readFile(this.pathFor(key)));
  }

  async deleteObject(key: string) {
    await unlink(this.pathFor(key)).catch((error: NodeJS.ErrnoException) => {
      if (error.code !== "ENOENT") throw error;
    });
  }

  publicUrl(key: string) {
    const base = process.env.STORAGE_PUBLIC_BASE_URL?.trim();
    return base ? `${base.replace(/\/$/, "")}/${encodePath(key)}` : null;
  }
}

class S3ObjectStorage implements ObjectStorage {
  private readonly endpoint: URL;
  private readonly region = process.env.STORAGE_REGION || "us-east-1";
  private readonly bucket: string;
  private readonly accessKey: string;
  private readonly secretKey: string;

  constructor() {
    const endpoint = process.env.STORAGE_ENDPOINT?.trim();
    const bucket = process.env.STORAGE_BUCKET?.trim();
    const accessKey = process.env.STORAGE_ACCESS_KEY?.trim();
    const secretKey = process.env.STORAGE_SECRET_KEY?.trim();
    if (!endpoint || !bucket || !accessKey || !secretKey) {
      throw new Error(
        "S3 存储需要配置 STORAGE_ENDPOINT、STORAGE_BUCKET、STORAGE_ACCESS_KEY 和 STORAGE_SECRET_KEY。",
      );
    }
    this.endpoint = new URL(endpoint);
    this.bucket = bucket;
    this.accessKey = accessKey;
    this.secretKey = secretKey;
  }

  private urlFor(key: string) {
    const base = this.endpoint.toString().replace(/\/$/, "");
    return new URL(
      `${base}/${encodeURIComponent(this.bucket)}/${encodePath(key)}`,
    );
  }

  private async request(
    method: "PUT" | "GET" | "DELETE",
    key: string,
    body?: Uint8Array,
    contentType?: string,
  ) {
    const url = this.urlFor(key);
    const now = new Date();
    const date = now.toISOString().replace(/[:-]|\.\d{3}/g, "");
    const shortDate = date.slice(0, 8);
    const payloadHash = sha256(body ?? new Uint8Array());
    const headers: Record<string, string> = {
      host: url.host,
      "x-amz-content-sha256": payloadHash,
      "x-amz-date": date,
    };
    if (contentType) headers["content-type"] = contentType;
    const canonicalHeaders = Object.keys(headers)
      .sort()
      .map((name) => `${name}:${headers[name].trim()}\n`)
      .join("");
    const signedHeaders = Object.keys(headers).sort().join(";");
    const canonicalRequest = `${method}\n${url.pathname}\n\n${canonicalHeaders}\n${signedHeaders}\n${payloadHash}`;
    const scope = `${shortDate}/${this.region}/s3/aws4_request`;
    const stringToSign = `AWS4-HMAC-SHA256\n${date}\n${scope}\n${sha256(canonicalRequest)}`;
    const dateKey = createHmac("sha256", `AWS4${this.secretKey}`)
      .update(shortDate)
      .digest();
    const regionKey = createHmac("sha256", dateKey)
      .update(this.region)
      .digest();
    const serviceKey = createHmac("sha256", regionKey).update("s3").digest();
    const signingKey = createHmac("sha256", serviceKey)
      .update("aws4_request")
      .digest();
    headers.authorization = `AWS4-HMAC-SHA256 Credential=${this.accessKey}/${scope}, SignedHeaders=${signedHeaders}, Signature=${createHmac("sha256", signingKey).update(stringToSign).digest("hex")}`;
    const response = await fetch(url, {
      method,
      headers,
      body: body ? Buffer.from(body) : undefined,
    });
    if (!response.ok)
      throw new Error(
        `对象存储请求失败：${response.status} ${response.statusText}`,
      );
    return response;
  }

  async putObject({ key, body, contentType }: PutObjectInput) {
    await this.request("PUT", key, body, contentType);
  }

  async getObject(key: string) {
    return new Uint8Array(await (await this.request("GET", key)).arrayBuffer());
  }

  async deleteObject(key: string) {
    await this.request("DELETE", key);
  }

  publicUrl(key: string) {
    const base = process.env.STORAGE_PUBLIC_BASE_URL?.trim();
    return base ? `${base.replace(/\/$/, "")}/${encodePath(key)}` : null;
  }
}

export function createObjectKey(assetType: string, safeName: string) {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, "/");
  return `assets/${assetType.toLowerCase()}/${date}/${crypto.randomUUID()}-${safeName}`;
}

export function checksumSha256(body: Uint8Array) {
  return sha256(body);
}

export function getObjectStorage(): ObjectStorage {
  return process.env.STORAGE_DRIVER?.toLowerCase() === "s3"
    ? new S3ObjectStorage()
    : new LocalObjectStorage();
}
