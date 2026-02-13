export default function Disclaimer() {
  return (
    <footer className="mt-12 border-t border-navy-800 pt-6 pb-8">
      <p className="text-xs text-navy-500 leading-relaxed max-w-3xl">
        This tool provides estimates based on publicly available AAMC data and school-reported
        statistics. Actual admissions decisions involve holistic review of many factors not captured
        here, including personal statements, letters of recommendation, interview performance, and
        life experiences. This tool is not affiliated with AAMC or any medical school.
      </p>
      <p className="text-xs text-navy-600 mt-2">
        Data sources: AAMC FACTS Table A-23 (2021–2024), AAMC MSAR, individual school class
        profiles, ProspectiveDoctor GPA/MCAT Database.
      </p>
    </footer>
  );
}
