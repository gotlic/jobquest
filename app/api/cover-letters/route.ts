import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

function spaceId(req: NextRequest): number {
  return parseInt(req.headers.get('x-space-id') ?? '1', 10) || 1;
}

const DEFAULT_LETTERS = [
  {
    title: 'Lettre type — Amélioration Continue',
    category_id: null,
    content: `Madame, Monsieur,

Passionné(e) par l'optimisation des processus industriels, je me permets de vous adresser ma candidature pour le poste de [INTITULÉ DU POSTE] au sein de [ENTREPRISE].

Au cours de mes expériences, j'ai développé une solide expertise en méthodologies Lean et Six Sigma, en conduite de chantiers Kaizen et en déploiement d'indicateurs de performance (KPI). Mon approche terrain me permet d'identifier rapidement les sources de gaspillage et de fédérer les équipes autour de solutions durables.

Ce qui m'attire particulièrement chez [ENTREPRISE], c'est [POINT SPÉCIFIQUE À L'ENTREPRISE]. Je suis convaincu(e) que ma rigueur méthodologique et mon sens du travail collaboratif seraient de véritables atouts pour contribuer à vos projets d'amélioration.

Dans l'attente d'un échange, je reste disponible pour tout entretien à votre convenance.

Cordialement,
[PRÉNOM NOM]`,
  },
  {
    title: 'Lettre type — Industrie / Production',
    category_id: null,
    content: `Madame, Monsieur,

Fort(e) d'une expérience en environnement industriel, je vous soumets ma candidature pour le poste de [INTITULÉ DU POSTE] au sein de [ENTREPRISE].

Ma maîtrise des outils de gestion de production (ERP, GPAO) et mon expérience du pilotage d'équipes en production me permettent d'assurer fiabilité, sécurité et performance sur le terrain. J'ai notamment contribué à [RÉALISATION CLEF : ex. réduction des temps d'arrêt machine de X%].

Votre site de [LIEU] est reconnu pour [POINT FORT ENTREPRISE], et c'est précisément ce type de challenge industriel qui m'anime.

Je serais ravi(e) de vous présenter mon parcours lors d'un entretien.

Cordialement,
[PRÉNOM NOM]`,
  },
  {
    title: 'Lettre type — Conception Produit',
    category_id: null,
    content: `Madame, Monsieur,

La conception de produits innovants et fonctionnels est au cœur de ma démarche professionnelle. C'est pourquoi je vous adresse ma candidature pour le poste de [INTITULÉ DU POSTE] chez [ENTREPRISE].

Maîtrisant les outils CAO (SolidWorks, CATIA) et les démarches de conception centrée utilisateur, j'ai mené des projets de bout en bout : de l'analyse du besoin jusqu'aux phases de prototypage et de validation. Mon souci du détail et ma vision systémique me permettent d'anticiper les contraintes de fabrication dès la phase de conception.

[ENTREPRISE] développe des produits qui [CONTEXTE / MARCHÉ], et je suis particulièrement motivé(e) à contribuer à cette mission.

Dans l'attente de vous rencontrer, je reste à votre disposition.

Cordialement,
[PRÉNOM NOM]`,
  },
];

export async function GET(req: NextRequest) {
  const db = await getDb();
  const sid = spaceId(req);
  const count = (db.prepare('SELECT COUNT(*) as c FROM cover_letters WHERE space_id = ?').get(sid) as { c: number }).c;
  if (count === 0) {
    DEFAULT_LETTERS.forEach(l => {
      db.prepare('INSERT INTO cover_letters (space_id, title, content, category_id) VALUES (?, ?, ?, ?)').run(sid, l.title, l.content, l.category_id);
    });
  }
  const letters = db.prepare('SELECT * FROM cover_letters WHERE space_id = ? ORDER BY id').all(sid);
  return NextResponse.json(letters);
}

export async function POST(req: NextRequest) {
  const db = await getDb();
  const body = await req.json();
  const sid = spaceId(req);
  const result = db.prepare(`
    INSERT INTO cover_letters (space_id, title, content, category_id, is_default)
    VALUES (?, ?, ?, ?, ?)
  `).run(sid, body.title, body.content ?? '', body.category_id ?? null, body.is_default ? 1 : 0);
  return NextResponse.json(db.prepare('SELECT * FROM cover_letters WHERE id = ?').get(result.lastInsertRowid), { status: 201 });
}
