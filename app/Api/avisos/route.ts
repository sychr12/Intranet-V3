import { NextResponse } from "next/server";
import mysql from "mysql2/promise";
import { writeFile } from "fs/promises";
import path from "path";

// Configuração do banco MySQL
const dbConfig = {
  host: "localhost",
  user: "root",
  password: "SUA_SENHA_DO_MYSQL",
  database: "intranetdb",
};

export async function POST(req: Request) {
  const connection = await mysql.createConnection(dbConfig);

  try {
    const formData = await req.formData();
    const titulo = formData.get("titulo")?.toString() || "";
    const texto = formData.get("texto")?.toString() || "";
    const imagem = formData.get("imagem") as File | null;

    let imagemPath: string | null = null;

    // Salvar a imagem na pasta /public/uploads
    if (imagem) {
      const bytes = await imagem.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const fileName = `${Date.now()}_${imagem.name}`;
      const uploadPath = path.join(process.cwd(), "public", "uploads", fileName);
      await writeFile(uploadPath, buffer);
      imagemPath = `/uploads/${fileName}`;
    }

    // Inserir os dados no MySQL
    const [result] = await connection.execute(
      "INSERT INTO avisos (titulo, texto, imagem) VALUES (?, ?, ?)",
      [titulo, texto, imagemPath]
    );

    console.log("✅ Novo aviso salvo:", { titulo, texto, imagemPath });

    return NextResponse.json({
      ok: true,
      message: "Aviso salvo com sucesso!",
    });
  } catch (error) {
    console.error("❌ Erro ao salvar aviso:", error);
    return NextResponse.json(
      { ok: false, message: "Erro ao salvar aviso." },
      { status: 500 }
    );
  } finally {
    await connection.end();
  }
}
