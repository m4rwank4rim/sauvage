fetch('https://sauvage-kohl.vercel.app/_next/static/css/de5d854266dc3b5c.css')
  .then(r => r.text())
  .then(t => {
    // Find all font-family with font-display
    const matches = t.match(/font-family[^;]*font-display[^;]*/g);
    console.log('font-display font-family:', matches);
    // Search for h1, h2
    const h1 = t.match(/h1[^{]*\{[^}]*font-family[^}]*\}/g);
    console.log('h1:', h1);
    const h2 = t.match(/h2[^{]*\{[^}]*font-family[^}]*\}/g);
    console.log('h2:', h2);
    // Search for combined selector
    const combined = t.match(/h1,\s*h2,\s*h3[^{]*\{[^}]*font-family[^}]*\}/g);
    console.log('combined:', combined);
    // Search for heading classes
    const headingClass = t.match(/\.font-display[^}]*font-family[^}]*\}/g);
    console.log('.font-display:', headingClass);
  })
  .catch(console.error);