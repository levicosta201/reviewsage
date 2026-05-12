import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { hash } from "bcryptjs";
import { slugify } from "@/lib/utils";

export async function POST(req: NextRequest) {
  try {
    const { name, orgName, email, password } = await req.json();

    if (!name || !orgName || !email || !password) {
      return NextResponse.json({ error: "Todos os campos são obrigatórios." }, { status: 400 });
    }
    if (password.length < 8) {
      return NextResponse.json({ error: "Senha deve ter no mínimo 8 caracteres." }, { status: 400 });
    }

    const existing = await db.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "Este email já está cadastrado." }, { status: 409 });
    }

    const hashedPassword = await hash(password, 12);
    const slug = await generateUniqueSlug(slugify(orgName));

    const user = await db.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        organizations: {
          create: {
            role: "OWNER",
            organization: {
              create: { name: orgName, slug },
            },
          },
        },
      },
    });

    return NextResponse.json({ id: user.id }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Erro interno do servidor." }, { status: 500 });
  }
}

async function generateUniqueSlug(base: string): Promise<string> {
  let slug = base;
  let i = 0;
  while (await db.organization.findUnique({ where: { slug } })) {
    slug = `${base}-${++i}`;
  }
  return slug;
}
