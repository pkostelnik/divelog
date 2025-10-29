export default function DatenschutzPage() {
  return (
    <section className="mx-auto w-full max-w-3xl space-y-4 px-6 py-12">
      <h1 className="text-3xl font-bold tracking-tight text-slate-900">Datenschutzhinweise (Demo)</h1>
      <p className="text-sm text-slate-600">
        Diese Demo-App speichert keine personenbezogenen Daten. Es kommen ausschließlich statische Mock-Daten zum Einsatz, die im Browser gerendert werden.
      </p>
      <p className="text-sm text-slate-600">
        In einer produktiven Variante würden hier die Zwecke der Datenverarbeitung, Rechtsgrundlagen sowie Auskunfts- und Löschrechte detailliert beschrieben.
      </p>
    </section>
  );
}
