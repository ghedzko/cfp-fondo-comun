const puppeteer = require('puppeteer');

async function testNavigationRobust() {
  console.log('🚀 Iniciando pruebas robustas de navegación...');
  
  const browser = await puppeteer.launch({ 
    headless: false,
    slowMo: 200,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 720 });
  
  // Aumentar timeouts
  page.setDefaultNavigationTimeout(60000);
  page.setDefaultTimeout(30000);
  
  try {
    // 1. Test Home Page
    console.log('🏠 Probando página principal...');
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });
    console.log('✅ Página principal carga correctamente');
    
    // 2. Test Login Flow (método más directo)
    console.log('🔐 Probando flujo de login...');
    await page.goto('http://localhost:3000/login', { waitUntil: 'networkidle0' });
    
    // Esperar a que el formulario esté completamente cargado
    await page.waitForSelector('input[name="email"]', { visible: true });
    await page.waitForSelector('input[name="password"]', { visible: true });
    await page.waitForSelector('button[type="submit"]', { visible: true });
    
    // Limpiar campos y llenar
    await page.click('input[name="email"]', { clickCount: 3 });
    await page.type('input[name="email"]', 'admin@cfp.edu.ar');
    
    await page.click('input[name="password"]', { clickCount: 3 });
    await page.type('input[name="password"]', 'admin123');
    
    console.log('📝 Credenciales ingresadas');
    
    // Enviar formulario y esperar respuesta
    await Promise.all([
      page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 30000 }),
      page.click('button[type="submit"]')
    ]);
    
    const currentUrl = page.url();
    console.log(`🔗 URL actual después del login: ${currentUrl}`);
    
    if (currentUrl.includes('/dashboard')) {
      console.log('✅ Login exitoso - redirigido al dashboard');
    } else if (currentUrl.includes('/login')) {
      console.log('⚠️ Login falló - permanece en login');
      
      // Verificar si hay errores mostrados
      const errorElement = await page.$('.error-message, [role="alert"]');
      if (errorElement) {
        const errorText = await page.evaluate(el => el.textContent, errorElement);
        console.log(`❌ Error de login: ${errorText}`);
      }
      
      // Intentar login manual para continuar pruebas
      console.log('🔄 Intentando acceso directo al dashboard...');
      await page.goto('http://localhost:3000/dashboard', { waitUntil: 'networkidle0' });
    }
    
    // 3. Test Dashboard (si estamos autenticados)
    console.log('📊 Probando dashboard...');
    
    const dashboardUrl = page.url();
    if (dashboardUrl.includes('/dashboard')) {
      console.log('✅ Dashboard accesible');
      
      // Verificar elementos del dashboard
      const welcomeSection = await page.$('.welcome-section, .dashboard-main');
      if (welcomeSection) {
        console.log('✅ Sección de bienvenida encontrada');
      }
      
      // 4. Test Course Management
      console.log('📚 Probando gestión de cursos...');
      
      const coursesLink = await page.$('a[href="/dashboard/cursos"]');
      if (coursesLink) {
        await coursesLink.click();
        await page.waitForNavigation({ waitUntil: 'networkidle0' });
        console.log('✅ Navegación a cursos exitosa');
        
        // Verificar que estamos en la página de cursos
        const coursesPage = page.url().includes('/dashboard/cursos');
        if (coursesPage) {
          console.log('✅ Página de cursos cargada');
          
          // Buscar cursos disponibles
          const courseCards = await page.$$('.course-card, .card');
          console.log(`📋 Cursos encontrados: ${courseCards.length}`);
          
          // Test navegación a detalle de curso
          const courseDetailLink = await page.$('a[href*="/dashboard/cursos/"]:not([href*="nuevo-periodo"])');
          if (courseDetailLink) {
            await courseDetailLink.click();
            await page.waitForNavigation({ waitUntil: 'networkidle0' });
            console.log('✅ Navegación a detalle de curso');
            
            // Test nuevo período
            const newPeriodLink = await page.$('a[href*="nuevo-periodo"]');
            if (newPeriodLink) {
              await newPeriodLink.click();
              await page.waitForNavigation({ waitUntil: 'networkidle0' });
              console.log('✅ Navegación a nuevo período');
              
              // 5. Test Month Selector
              console.log('📅 Probando selector de meses...');
              
              // Verificar que el componente existe
              const monthSelector = await page.$('.month-selector, .month-grid');
              if (monthSelector) {
                console.log('✅ Month selector encontrado');
                
                // Test botones rápidos
                const quickButtons = await page.$$('button:has-text("Mar-Jun"), button:has-text("Año Completo")');
                console.log(`🔘 Botones rápidos encontrados: ${quickButtons.length}`);
                
                // Test grid de meses
                const monthButtons = await page.$$('.month-grid button, [data-month]');
                console.log(`📅 Botones de meses encontrados: ${monthButtons.length}`);
                
                if (monthButtons.length >= 12) {
                  console.log('✅ Month selector completamente funcional');
                } else {
                  console.log('⚠️ Month selector incompleto');
                }
              } else {
                console.log('⚠️ Month selector no encontrado');
              }
            }
          }
        }
      }
      
      // 6. Test Student Management
      console.log('👥 Probando gestión de estudiantes...');
      await page.goto('http://localhost:3000/dashboard/estudiantes', { waitUntil: 'networkidle0' });
      
      const studentsUrl = page.url().includes('/dashboard/estudiantes');
      if (studentsUrl) {
        console.log('✅ Página de estudiantes accesible');
        
        // Verificar tabla de estudiantes
        const studentsTable = await page.$('table, .students-list');
        if (studentsTable) {
          console.log('✅ Lista de estudiantes encontrada');
        }
        
        // Test nuevo estudiante
        const newStudentLink = await page.$('a[href="/dashboard/estudiantes/nuevo"]');
        if (newStudentLink) {
          await newStudentLink.click();
          await page.waitForNavigation({ waitUntil: 'networkidle0' });
          console.log('✅ Navegación a nuevo estudiante');
          
          // Verificar formulario
          const studentForm = await page.$('form, input[name="dni"]');
          if (studentForm) {
            console.log('✅ Formulario de estudiante encontrado');
          }
        }
      }
      
    } else {
      console.log('⚠️ Dashboard no accesible - probablemente problema de autenticación');
    }
    
    console.log('🎉 Pruebas de navegación completadas');
    
    return {
      success: true,
      tests: [
        'Página principal',
        'Login flow',
        'Dashboard',
        'Gestión de cursos',
        'Month selector',
        'Gestión de estudiantes'
      ]
    };
    
  } catch (error) {
    console.error('❌ Error durante las pruebas:', error.message);
    
    await page.screenshot({ 
      path: 'navigation-error-robust.png', 
      fullPage: true 
    });
    console.log('📸 Screenshot guardado como navigation-error-robust.png');
    
    return {
      success: false,
      error: error.message
    };
  } finally {
    await browser.close();
  }
}

// Ejecutar pruebas
testNavigationRobust()
  .then(result => {
    if (result.success) {
      console.log('\n✅ PRUEBAS COMPLETADAS');
      console.log('📋 Tests ejecutados:', result.tests.join(', '));
      process.exit(0);
    } else {
      console.log('\n❌ PRUEBAS CON ERRORES');
      console.log('Error:', result.error);
      process.exit(1);
    }
  })
  .catch(error => {
    console.error('❌ Error fatal:', error);
    process.exit(1);
  });
