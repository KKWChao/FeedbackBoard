import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";

export async function POST(req) {
  const links = [];
  const s3Client = new S3Client({
    region: "us-west-1",
    credentials: {
      accessKeyId: process.env.NEXT_PUBLIC_S3_ACCESS_KEY,
      secretAccessKey: process.env.NEXT_PUBLIC_S3_SECRET_ACCESS_KEY,
    },
  });

  const formData = await req.formData();

  for (const fileInfo of formData) {
    const file = fileInfo[1];
    const name = Date.now().toString() + file.name;

    const chunks = [];
    for await (const chunk of file.stream()) {
      chunks.push(chunk);
    }
    const buffer = Buffer.concat(chunks);

    await s3Client
      .send(
        new PutObjectCommand({
          Bucket: "kc-feedback-boards",
          Key: name,
          ACL: "public-read",
          Body: buffer,
          ContentType: file.type,
        })
      )
      .catch((err) => console.log(err));
    links.push("https://kc-feedback-boards.s3.amazonaws.com/" + name);
  }

  return Response.json(links);
}
