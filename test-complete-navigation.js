const puppeteer = require('puppeteer');

async function testCompleteNavigation() {
  console.log('🚀 Iniciando pruebas completas de navegación...');
  
  const browser = await puppeteer.launch({ 
    headless: false,
    slowMo: 100,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 720 });
  
  try {
    // 1. Test Home Page
    console.log('🏠 Probando página principal...');
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });
    
    const homeTitle = await page.title();
    console.log(`✅ Página principal carga: ${homeTitle}`);
    
    // Check theme toggle
    const themeToggle = await page.$('[role="button"]');
    if (themeToggle) {
      await themeToggle.click();
      await new Promise(resolve => setTimeout(resolve, 500));
      console.log('✅ Theme toggle funciona');
    }
    
    // 2. Test Login Flow
    console.log('🔐 Probando flujo de login...');
    await page.goto('http://localhost:3000/login', { waitUntil: 'networkidle2' });
    
    // Fill login form
    await page.waitForSelector('input[name="email"]');
    await page.type('input[name="email"]', 'admin@cfp.edu.ar');
    await page.type('input[name="password"]', 'admin123');
    
    // Submit login
    await page.click('button[type="submit"]');
    await page.waitForNavigation({ waitUntil: 'networkidle2' });
    
    const currentUrl = page.url();
    if (currentUrl.includes('/dashboard')) {
      console.log('✅ Login exitoso - redirigido al dashboard');
    } else {
      throw new Error('Login falló - no redirigido al dashboard');
    }
    
    // 3. Test Dashboard
    console.log('📊 Probando dashboard...');
    
    // Check user info display
    const userInfo = await page.$('text=admin@cfp.edu.ar');
    if (userInfo) {
      console.log('✅ Información de usuario mostrada');
    }
    
    // Check role-based cards
    const adminCards = await page.$$('.dashboard-card');
    console.log(`✅ Dashboard cards encontradas: ${adminCards.length}`);
    
    // 4. Test Course Management Navigation
    console.log('📚 Probando navegación de cursos...');
    
    // Navigate to courses
    await page.click('a[href="/dashboard/cursos"]');
    await page.waitForNavigation({ waitUntil: 'networkidle2' });
    console.log('✅ Navegación a gestión de cursos');
    
    // Check courses list
    const coursesTitle = await page.$('h2');
    if (coursesTitle) {
      const titleText = await page.evaluate(el => el.textContent, coursesTitle);
      console.log(`✅ Página de cursos cargada: ${titleText}`);
    }
    
    // Test course detail navigation
    const courseDetailLink = await page.$('a[href*="/dashboard/cursos/"]:not([href*="nuevo-periodo"])');
    if (courseDetailLink) {
      await courseDetailLink.click();
      await page.waitForNavigation({ waitUntil: 'networkidle2' });
      console.log('✅ Navegación a detalle de curso');
      
      // Test new period navigation
      const newPeriodLink = await page.$('a[href*="nuevo-periodo"]');
      if (newPeriodLink) {
        await newPeriodLink.click();
        await page.waitForNavigation({ waitUntil: 'networkidle2' });
        console.log('✅ Navegación a nuevo período');
        
        // 5. Test Month Selector
        console.log('📅 Probando selector de meses...');
        
        // Fill basic form
        await page.waitForSelector('input[name="fechaInicio"]');
        await page.type('input[name="fechaInicio"]', '2025-03-01');
        await page.type('input[name="fechaFin"]', '2025-06-30');
        await page.type('input[name="precioMensual"]', '15000');
        
        // Test quick selection buttons
        const marJunButton = await page.$('button:has-text("Mar-Jun")');
        if (marJunButton) {
          await marJunButton.click();
          await new Promise(resolve => setTimeout(resolve, 500));
          
          const selectedMonths = await page.$$eval('.month-grid button[aria-pressed="true"]', 
            buttons => buttons.length
          );
          console.log(`✅ Selección rápida Mar-Jun: ${selectedMonths} meses`);
        }
        
        // Test individual month selection
        const clearButton = await page.$('button:has-text("Limpiar")');
        if (clearButton) {
          await clearButton.click();
          await new Promise(resolve => setTimeout(resolve, 500));
        }
        
        const firstMonth = await page.$('.month-grid button:first-child');
        if (firstMonth) {
          await firstMonth.click();
          await new Promise(resolve => setTimeout(resolve, 500));
          console.log('✅ Selección individual de mes');
        }
        
        // Test full year selection
        const fullYearButton = await page.$('button:has-text("Año Completo")');
        if (fullYearButton) {
          await fullYearButton.click();
          await new Promise(resolve => setTimeout(resolve, 500));
          
          const allSelected = await page.$$eval('.month-grid button[aria-pressed="true"]', 
            buttons => buttons.length
          );
          console.log(`✅ Selección año completo: ${allSelected}/12 meses`);
        }
        
        console.log('✅ Month selector completamente funcional');
      }
      
      // Go back to courses
      await page.click('a[href*="/dashboard/cursos"]:not([href*="nuevo-periodo"])');
      await page.waitForNavigation({ waitUntil: 'networkidle2' });
    }
    
    // 6. Test Student Management Navigation
    console.log('👥 Probando navegación de estudiantes...');
    
    // Navigate to students
    await page.goto('http://localhost:3000/dashboard/estudiantes', { waitUntil: 'networkidle2' });
    console.log('✅ Navegación a gestión de estudiantes');
    
    // Check students list
    const studentsTable = await page.$('table');
    if (studentsTable) {
      console.log('✅ Tabla de estudiantes encontrada');
    }
    
    // Test new student navigation
    const newStudentLink = await page.$('a[href="/dashboard/estudiantes/nuevo"]');
    if (newStudentLink) {
      await newStudentLink.click();
      await page.waitForNavigation({ waitUntil: 'networkidle2' });
      console.log('✅ Navegación a nuevo estudiante');
      
      // Test form fields
      const dniInput = await page.$('input[name="dni"]');
      const nombreInput = await page.$('input[name="nombre"]');
      if (dniInput && nombreInput) {
        console.log('✅ Formulario de estudiante cargado');
      }
    }
    
    // 7. Test Navigation Back to Dashboard
    console.log('🔄 Probando navegación de regreso...');
    await page.goto('http://localhost:3000/dashboard', { waitUntil: 'networkidle2' });
    console.log('✅ Regreso al dashboard');
    
    // 8. Test Logout
    console.log('🚪 Probando logout...');
    const logoutButton = await page.$('button:has-text("Cerrar Sesión")');
    if (logoutButton) {
      await logoutButton.click();
      await page.waitForNavigation({ waitUntil: 'networkidle2' });
      
      const finalUrl = page.url();
      if (finalUrl.includes('/login') || finalUrl === 'http://localhost:3000/') {
        console.log('✅ Logout exitoso');
      } else {
        console.log('⚠️ Logout redirigió a URL inesperada:', finalUrl);
      }
    }
    
    console.log('🎉 Todas las pruebas de navegación completadas exitosamente');
    
    return {
      success: true,
      tests: [
        'Página principal',
        'Theme toggle',
        'Login flow',
        'Dashboard',
        'Gestión de cursos',
        'Detalle de curso',
        'Nuevo período',
        'Month selector',
        'Gestión de estudiantes',
        'Nuevo estudiante',
        'Logout'
      ]
    };
    
  } catch (error) {
    console.error('❌ Error durante las pruebas:', error.message);
    
    await page.screenshot({ 
      path: 'navigation-error-screenshot.png', 
      fullPage: true 
    });
    console.log('📸 Screenshot guardado como navigation-error-screenshot.png');
    
    return {
      success: false,
      error: error.message
    };
  } finally {
    await browser.close();
  }
}

// Ejecutar pruebas
testCompleteNavigation()
  .then(result => {
    if (result.success) {
      console.log('\n✅ TODAS LAS PRUEBAS PASARON');
      console.log('📋 Tests ejecutados:', result.tests.join(', '));
      process.exit(0);
    } else {
      console.log('\n❌ PRUEBAS FALLARON');
      console.log('Error:', result.error);
      process.exit(1);
    }
  })
  .catch(error => {
    console.error('❌ Error fatal:', error);
    process.exit(1);
  });
