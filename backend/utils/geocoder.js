async function geocodeHospital(hospital) {
  const queries = [
    `${hospital.upazila}, ${hospital.district}, ${hospital.division}, Bangladesh`,
    `${hospital.district}, ${hospital.division}, Bangladesh`,
    `${hospital.division}, Bangladesh`,
  ].filter(q => !q.startsWith('undefined') && !q.startsWith('null'));

  for (const query of queries) {
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1&countrycodes=bd`;

    const res = await fetch(url, {
      headers: { 'User-Agent': 'HospitalManager/1.0 (bangladesh-hospital-manager)' }
    });
    const data = await res.json();

    if (data.length > 0) {
      return {
        lat: parseFloat(data[0].lat),
        lon: parseFloat(data[0].lon),
        displayName: data[0].display_name
      };
    }

    // Nominatim rate limit: 1 request per second
    await new Promise(r => setTimeout(r, 1100));
  }

  return null;
}

module.exports = { geocodeHospital };
