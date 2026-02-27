export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50 text-gray-900">
      {/* HERO SECTION */}
      <section className="relative overflow-hidden">
        {/* Gradient Background */}
        <div className="absolute inset-0  from-blue-50 via-white to-indigo-100 -z-10"></div>

        <div className="max-w-6xl mx-auto px-6 pt-32 pb-32 text-center">
          <h1 className="text-4xl md:text-6xl font-bold leading-tight max-w-4xl mx-auto">
            AsaHub – Pusat Harapan Ekosistem
            <span className="block text-blue-600">Bisnis & Teknologi</span>
          </h1>

          <p className="mt-8 text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
            Menghubungkan bisnis, jasa, edukasi, dan peluang ekonomi dalam satu
            platform digital masa depan.
          </p>

          <div className="mt-12 flex justify-center gap-5 flex-wrap">
            <button className="px-8 py-3 bg-blue-600 text-white rounded-2xl shadow-lg hover:bg-blue-700 transition duration-300">
              Mulai AsaHub
            </button>

            <button className="px-8 py-3 bg-white border border-gray-300 rounded-2xl hover:bg-gray-100 transition duration-300">
              Tentang Platform
            </button>
          </div>
        </div>
      </section>

      {/* FEATURE SECTION */}
      <section className="max-w-6xl mx-auto px-6 py-28">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">
          Mengapa AsaHub?
        </h2>

        <div className="grid md:grid-cols-3 gap-10">
          <div className="bg-white p-8 rounded-3xl shadow-md hover:shadow-xl transition duration-300">
            <h3 className="text-xl font-semibold mb-4">Ekosistem Bisnis</h3>
            <p className="text-gray-600 leading-relaxed">
              Menghubungkan usaha, jasa, dan peluang ekonomi dalam satu platform
              terintegrasi.
            </p>
          </div>

          <div className="bg-white p-8 rounded-3xl shadow-md hover:shadow-xl transition duration-300">
            <h3 className="text-xl font-semibold mb-4">Teknologi UMKM</h3>
            <p className="text-gray-600 leading-relaxed">
              Memberikan solusi digital praktis untuk pelaku usaha kecil dan
              menengah.
            </p>
          </div>

          <div className="bg-white p-8 rounded-3xl shadow-md hover:shadow-xl transition duration-300">
            <h3 className="text-xl font-semibold mb-4">Pemberdayaan</h3>
            <p className="text-gray-600 leading-relaxed">
              Edukasi dan mentoring untuk meningkatkan kualitas ekonomi
              masyarakat secara berkelanjutan.
            </p>
          </div>
        </div>
      </section>

      {/* VISI SECTION */}
      <section className="bg-white py-28">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-10">Visi AsaHub</h2>

          <p className="text-lg text-gray-600 leading-relaxed">
            AsaHub lahir dari perjalanan panjang membangun harapan ekonomi
            digital. Platform ini dirancang sebagai pusat ekosistem bisnis,
            teknologi, dan pemberdayaan masyarakat untuk bertumbuh bersama
            menuju masa depan yang lebih stabil dan inklusif.
          </p>
        </div>
      </section>
    </main>
  );
}
