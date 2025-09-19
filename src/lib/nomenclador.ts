// Nomenclador Oficial de Formación Profesional - Chubut 2025
// Basado en Res. 681/12 Anexo II

export interface Area {
  code: string;
  name: string;
}

export interface NomencladorCourse {
  areaCode: string;
  profileCode: string;
  name: string;
  duration: number; // horas reloj
  requirements: string;
  certificateLevel: string;
  certification: string;
  programming?: string;
  legalInstrument?: string;
  observations?: string;
}

// Áreas fijas del nomenclador
export const AREAS_FP: Area[] = [
  { code: 'I', name: 'GESTIÓN DE LAS ORGANIZACIONES Y RECURSOS HUMANOS' },
  { code: 'II', name: 'INFORMÁTICA' },
  { code: 'III', name: 'SERVICIOS PARA LA INDUSTRIA Y EL COMERCIO' },
  { code: 'IV', name: 'CONSTRUCCIONES' },
  { code: 'V', name: 'INDUSTRIA ALIMENTARIA' },
  { code: 'VI', name: 'TEXTIL Y CUERO' },
  { code: 'VII', name: 'MADERA Y MUEBLES' },
  { code: 'VIII', name: 'METALMECÁNICA' },
  { code: 'IX', name: 'AUTOMOTRIZ' },
  { code: 'X', name: 'ELECTRICIDAD Y ELECTRÓNICA' },
  { code: 'XI', name: 'ENERGÍAS RENOVABLES' },
  { code: 'XII', name: 'SALUD Y AMBIENTE' },
  { code: 'XIII', name: 'TURISMO, HOTELERÍA Y GASTRONOMÍA' },
  { code: 'XIV', name: 'COMUNICACIÓN, ARTE Y DISEÑO' },
  { code: 'XV', name: 'AGROPECUARIA' },
];

// Cursos del nomenclador (basado en el CSV proporcionado)
export const NOMENCLADOR_COURSES: NomencladorCourse[] = [
  // ÁREA I - GESTIÓN DE LAS ORGANIZACIONES Y RECURSOS HUMANOS
  {
    areaCode: 'I',
    profileCode: '05',
    name: 'AUXILIAR DE SECRETARIO EJECUTIVO',
    duration: 250,
    requirements: 'Secundaria o Equivalente',
    certificateLevel: 'Nivel III',
    certification: 'Ministerial',
    programming: 'Rev. STFP II B',
  },
  {
    areaCode: 'I',
    profileCode: '06',
    name: 'SECRETARIO EJECUTIVO',
    duration: 500,
    requirements: 'Aux. Secretario Ejecutivo',
    certificateLevel: 'Nivel III',
    certification: 'Ministerial',
  },
  {
    areaCode: 'I',
    profileCode: '10',
    name: 'ORGANIZACIÓN DE COOPERATIVAS',
    duration: 125,
    requirements: 'Secundaria o Equivalente (o acreditar que esta en un programa de terminalidad)',
    certificateLevel: 'Nivel III',
    certification: 'Ministerial',
    programming: 'Rev. STFP II H',
    legalInstrument: 'Expediente Nº 50/13',
  },
  {
    areaCode: 'I',
    profileCode: '11',
    name: 'AUXILIAR PROTOCOLAR PARA LAS RELACIONES INSTITUCIONALES',
    duration: 250,
    requirements: 'Secundaria o Equivalente',
    certificateLevel: 'Nivel III',
    certification: 'Ministerial',
    programming: 'Rev. STFP II D',
    legalInstrument: 'Expediente Nº 19/10',
  },
  {
    areaCode: 'I',
    profileCode: '12',
    name: 'ASESOR PROTOCOLAR PARA LAS RELACIONES INSTITUCIONALES',
    duration: 250,
    requirements: 'Auxiliar Protocolar p/las Relaciones Institucionales',
    certificateLevel: 'Nivel III',
    certification: 'Ministerial',
    programming: 'Rev. STFP II D',
    legalInstrument: 'Expediente Nº 20/10',
  },
  {
    areaCode: 'I',
    profileCode: '14',
    name: 'ASISTENTE JURÍDICO',
    duration: 150,
    requirements: 'Secundaria o Equivalente',
    certificateLevel: 'Nivel III',
    certification: 'Ministerial',
    programming: 'DC - FORM. 03 FP Nuevo STFP II - I',
    legalInstrument: 'Expediente Nº 63/14. Elaborado por. Área de Evaluación a pedido de Coord. FP',
  },
  {
    areaCode: 'I',
    profileCode: '16',
    name: 'ASISTENTE PARA LA ADMINISTRACIÓN',
    duration: 125,
    requirements: 'Secundaria o Equivalente',
    certificateLevel: 'Nivel III',
    certification: 'Ministerial',
    programming: 'DC - FORM - 03 - Equipo de Diseño 2023',
  },
  {
    areaCode: 'I',
    profileCode: '22',
    name: 'ASISTENTE/A PARA ADMINISTRACIÓN Y GESTIÓN CON HERRAMIENTAS INFORMÁTICAS',
    duration: 360,
    requirements: 'Secundaria o Equivalente',
    certificateLevel: 'Nivel III',
    certification: 'Ministerial',
    programming: 'Marco de Referencia',
    legalInstrument: 'Res. CFE N° 460/23',
  },
  {
    areaCode: 'I',
    profileCode: '23',
    name: 'PROMOTOR/A DE COOPERATIVAS Y MUTUALES',
    duration: 360,
    requirements: 'Secundaria o Equivalente',
    certificateLevel: 'Nivel II',
    certification: 'Ministerial',
    programming: 'Marco de Referencia',
    legalInstrument: 'Res. CFE N° 474/24',
  },

  // ÁREA II - INFORMÁTICA
  {
    areaCode: 'II',
    profileCode: '03',
    name: 'OPERADOR DE INFORMÁTICA PARA ADMINISTRACIÓN Y GESTIÓN',
    duration: 250,
    requirements: 'Primaria o Equivalente',
    certificateLevel: 'Nivel II',
    certification: 'Ministerial',
    programming: 'Diseño Curricular',
    legalInstrument: 'Res. 36/15 ME-Chubut - Res. RINET-Homologación N° 373/16',
  },
  {
    areaCode: 'II',
    profileCode: '04',
    name: 'OPERADOR DE BASES DE DATOS PARA OFICINA',
    duration: 125,
    requirements: 'Ciclo Básico o EGB 3 - Operador de Inf. para Adm. y Gestión y/o acreditar conocimiento',
    certificateLevel: 'Nivel III',
    certification: 'Ministerial',
    programming: 'Rev. RED- II E',
    legalInstrument: 'Expediente Nº 39/11',
  },
  {
    areaCode: 'II',
    profileCode: '05',
    name: 'INTRODUCCIÓN AL DIBUJO TÉCNICO ASISTIDO POR P.C.',
    duration: 125,
    requirements: 'Primaria o Equivalente',
    certificateLevel: 'Nivel II',
    certification: 'Ministerial',
    programming: 'Rev.STFP II C',
  },
  {
    areaCode: 'II',
    profileCode: '06',
    name: 'DIBUJO ASISTIDO POR COMPUTADORA',
    duration: 125,
    requirements: 'Ciclo basico o EGB 3 + Acreditar Dibujo Técnico y manejo de P.C.',
    certificateLevel: 'Nivel III',
    certification: 'Ministerial',
    programming: 'Rev. STFP II B',
    observations: 'Capacitación para profesionales',
  },
  {
    areaCode: 'II',
    profileCode: '07',
    name: 'OPERADOR DE HERRAMIENTAS DE DISEÑO GRÁFICO EN COMPUTADORA',
    duration: 250,
    requirements: 'Ciclo Básico o EGB 3 + Acreditar manejo de P.C.',
    certificateLevel: 'Nivel III',
    certification: 'Ministerial',
    programming: 'DC - FORM - 03 - Equipo de Diseño 2018',
    legalInstrument: 'Expediente N° 78/2018',
  },
  {
    areaCode: 'II',
    profileCode: '08',
    name: 'DISEÑADOR Y ADMINISTRADOR DE PÁGINAS WEB',
    duration: 250,
    requirements: 'Ciclo Básico o EGB 3 + Operador de Inf. para Adm. y Gestión y/o acreditar conocimiento',
    certificateLevel: 'Nivel III',
    certification: 'Ministerial',
    programming: 'DC - FORM - 03 - Equipo de Diseño 2018',
    legalInstrument: 'Expediente N° 87/2018 antes expediente Nº 40/11',
  },
  {
    areaCode: 'II',
    profileCode: '09',
    name: 'MANTENIMIENTO Y REPARACIÓN DE EQUIPOS INFORMÁTICOS',
    duration: 250,
    requirements: 'Ciclo Básico o EGB 3 + Acreditar conocimiento de P.C.',
    certificateLevel: 'Nivel III',
    certification: 'Ministerial',
    programming: 'Rev. RED- II D',
    legalInstrument: 'Expedienten Nº 01/10',
  },
  {
    areaCode: 'II',
    profileCode: '10',
    name: 'INFORMÁTICA MULTIMEDIAL',
    duration: 125,
    requirements: 'Primaria o Equivalente',
    certificateLevel: 'Nivel II',
    certification: 'Ministerial',
    programming: 'Rev. RED- II F',
    legalInstrument: 'Expediente Nº 45/12',
  },
  {
    areaCode: 'II',
    profileCode: '11',
    name: 'INSTALADOR DE REDES INFORMÁTICAS',
    duration: 250,
    requirements: 'Secundaria o Equivalente + "Mantenimiento y reparacion de equipos informaticos"',
    certificateLevel: 'Nivel III',
    certification: 'Ministerial',
    programming: 'Rev. RED- II H',
    legalInstrument: 'Expediente Nº 51/13',
  },
  {
    areaCode: 'II',
    profileCode: '12',
    name: 'AUXILIAR EN INFORMÁTICA Cisco IT Essentials',
    duration: 250,
    requirements: 'Secundario o Equivalente',
    certificateLevel: 'Nivel III',
    certification: 'CISCO-INET',
    programming: 'DC - FORM - 03 - Nuevo - STFP II',
    legalInstrument: 'Expediente N° 76/16',
  },
  {
    areaCode: 'II',
    profileCode: '13',
    name: 'PROGRAMADOR',
    duration: 364,
    requirements: 'Secundaria o Equivalente',
    certificateLevel: 'Nivel III',
    certification: 'Ministerial',
    programming: 'Marco de Referencia',
    legalInstrument: 'Res. CFE N° 289/16',
  },
  {
    areaCode: 'II',
    profileCode: '14',
    name: 'INSTALADOR EN REDES INFORMÁTICAS Cisco Networking Essentials',
    duration: 125,
    requirements: 'Secundaria o Equivalente + Acreditar conocimiento de P.C.',
    certificateLevel: 'Nivel III',
    certification: 'Ministerial',
    programming: 'DC - FORM - 03 - Equipo de Diseño 2018',
    legalInstrument: 'Expediente Nº 90/19',
  },
  {
    areaCode: 'II',
    profileCode: '15',
    name: 'ASISTENTE EN SEGURIDAD INFORMÁTICA',
    duration: 125,
    requirements: 'Secundaria o Equivalente + Acreditar conocimiento de P.C.',
    certificateLevel: 'Nivel III',
    certification: 'Ministerial',
    legalInstrument: 'Expediente Nº 91/19',
  },
  {
    areaCode: 'II',
    profileCode: '16',
    name: 'OPERADOR BÁSICO DE IMPRESORAS 3D',
    duration: 125,
    requirements: 'Ciclo Básico o EGB 3 + Acreditar manejo de P.C.',
    certificateLevel: 'Nivel III',
    certification: 'Ministerial',
    programming: 'DC - FORM - 03 - Equipo de Diseño 2021',
  },
  {
    areaCode: 'II',
    profileCode: '20',
    name: 'MODELADOR PARA IMPRESIÓN 3D',
    duration: 240,
    requirements: 'Ciclo Básico o EGB 3 + Acreditar manejo de P.C.',
    certificateLevel: 'Nivel II',
    certification: 'Ministerial',
    programming: 'DC - FORM - 03 - Equipo de Diseño 2025',
  },

  // ÁREA III - SERVICIOS PARA LA INDUSTRIA Y EL COMERCIO
  {
    areaCode: 'III',
    profileCode: '02',
    name: 'ATENCIÓN AL CLIENTE',
    duration: 125,
    requirements: 'Primaria o Equivalente',
    certificateLevel: 'Nivel II',
    certification: 'Ministerial',
    programming: 'Rev. STFP II B',
  },
  {
    areaCode: 'III',
    profileCode: '03',
    name: 'AUXILIAR DE COMERCIO Y OFICINA',
    duration: 125,
    requirements: 'Ciclo Básico o EGB 3',
    certificateLevel: 'Nivel III',
    certification: 'Ministerial',
  },
];

// Helper functions
export const getAreaByCode = (code: string): Area | undefined => {
  return AREAS_FP.find(area => area.code === code);
};

export const getCoursesByArea = (areaCode: string): NomencladorCourse[] => {
  return NOMENCLADOR_COURSES.filter(course => course.areaCode === areaCode);
};

export const getCourseByCode = (areaCode: string, profileCode: string): NomencladorCourse | undefined => {
  return NOMENCLADOR_COURSES.find(
    course => course.areaCode === areaCode && course.profileCode === profileCode
  );
};
