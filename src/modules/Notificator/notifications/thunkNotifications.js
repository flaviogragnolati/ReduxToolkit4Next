import { PENDING, REJECTED, FULFILLED } from '@/constants/thunkStates';

const thunkNotifications = {
  dashboard: {
    getData: {
      [PENDING]: {
        message: 'Cargando datos...',
        variant: 'info',
      },
    },
  },
  data: {
    getData: {
      [PENDING]: {
        message: 'Cargando datos...',
        variant: 'info',
      },
    },
    createOne: {
      message: 'Nueva operación creada',
      variant: 'success',
    },
    updateOne: {
      message: 'Operación actualizada',
      variant: 'success',
    },
    cancelOne: {
      message: 'Estado de operación actualizada',
      variant: 'success',
    },
  },
  files: {
    bulkAdd: {
      [FULFILLED]: {
        message: 'Archivo agregado correctamente',
        variant: 'success',
      },
      [REJECTED]: {
        message: 'Error al cargar el archivo',
        variant: 'error',
      },
    },
    generateLinks: {
      [FULFILLED]: {
        message: 'Archivo con enlaces generado correctamente',
        variant: 'success',
      },
    },
    exportFile: {
      [FULFILLED]: {
        message: 'Exportacion exitosa',
        variant: 'success',
      },
      [REJECTED]: {
        message: 'Error al exportar el archivo',
        variant: 'error',
      },
    },
  },
};

export default thunkNotifications;
