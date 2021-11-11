# ReduxToolkit Workshop

## Terminologia:

- `actions`: Objeto que tiene una propiedad `type` del tipo `string` que describe que va a suceder en la aplicacion.
- `payload`: Un `action` tambien puede tener informacion, o contenido, el cual se asigna a la propiiedad `payload` del objeto `action`.
- `action creator`: Es una funcion que crea y retorna un objeto del tipo `action`.
- `reducers`: Funcion que recibe el `estado` actual y un objeto `action`, realiza una logica especifica y retorna un `nuevo estado`. `(state, action) => newState`
  - Los reducers deben **unicamente** calacular el nuevo estado en funcion del estado actual y la action que reciban.
  - Los reducers no deben manejar logica asincronica, para esto existen otras herramientas y metodos.
  - En general es recomendable utilizar un patron de _no_ mutacion directa del estado, aunque con `immer` esto puede realizarse (ver apartado de `immer`)
- `store`: Objeto que contiene la informacion o datos que se desean acceder desde cualquier parte de la aplicacion.
- `dispatch`: Metodo de la redux `store`.
  - Es la unica forma de actualizar/modificar el estado de la aplicacion, `store.dispatch(action)`, siguiendo el concepto de **ONE WAY FLOW** (ver conceptos fundamentales).
  - Ejecutar el metodo `dispatch` puede verse como un _triggerear un evento_ en la aplicacion que indica que algo sucedio y debe actualizarse el estado.
- `selectors`: Funciones que permiten _leer_ o _extraer_ datos del estado de la aplicacion. Evitar repetir logica de seleccion del estado y ademas permiten `memoize` resultados para optimizar el rendimiento.
- `hydrate`: Accion de _hidratar_ (actualizar) el objeto `estado`. Ejemplo, mantener una copia del `estado` en `local storage` y el `cliente` sincronizadas. Tambien para frameworks como `Next.js`, donde se desea mantener sincronizados los estados del `server` y el `cliente`.

## Conceptos fundamentales

1. Una sola fuente de verdad.
2. Un solo sentido de flujo de los datos.
3. Los reducers solo actualizan/modifican el estado en funcion de una accion y el estado _actual_. En el 99% de los casos no es recomendable que hayan _side effects_ dentro de los reducers, para eso se emplean otras herramientas y metodos (ej.: thunks, saga, etc.)
4. No es recomendable guardar en el estado datos **NO** serializables. No se recomienda guardar funciones o clases dentro del estado.

## Flujo

El flujo de informacion con Redux es siempre en **un solo** sentido.

![redux-flow-gif](https://redux.js.org/assets/images/ReduxDataFlowDiagram-49fa8c3968371d9ef6f2a1486bd40a26.gif)

## ReduxToolkit APIs mas importantes

### **createSlice**

Ejemplo simple:

```javascript
import { createSlice } from '@reduxjs/toolkit';

const initialState = { value: 0 }; // estado inicial

const counterSlice = createSlice({
  name: 'counter', // nombre del slice
  initialState,
  // Reducer sincronicos
  reducers: {
    increment(state) {
      state.value++;
    },
    decrement(state) {
      state.value--;
    },
    incrementByAmount(state, action) {
      state.value += action.payload;
    },
  },
});

export const { increment, decrement, incrementByAmount } = counterSlice.actions; //export de acciones
export default counterSlice.reducer; //export del reducer, a pasar a store
```

Ejemplo completo:

```javascript
import { configureStore } from '@reduxjs/toolkit';
import logger from 'redux-logger';
import ApiServices from 'api/services'; // ejemplo de servicio API
import rootReducer from './rootReducer';
import notificationMiddleware from 'redux/middleware/notificationMiddleware';

const ENVIRONMENT =
  process.env.REACT_APP_ENVIRONMENT || process.env.NODE_ENV || false;

const IS_PRODUCTION = ENVIRONMENT === 'production';
const DISABLE_NOTIFICATIONS = !!process.env.DISABLE_NOTIFICATIONS;

// extra arguments for thunk
const extraThunkArguments = {
  API: ApiServices, // podemos pasar a todos los thunks el servicio API
};
const middleware = (getDefaultMiddleware) => {
  const defaultMiddleware = getDefaultMiddleware({
    thunk: {
      extraArgument: extraThunkArguments,
    },
    immutableCheck: !IS_PRODUCTION,
    serializableCheck: !IS_PRODUCTION,
  });

  let customMiddleware = defaultMiddleware;
  if (!IS_PRODUCTION) customMiddleware = customMiddleware.concat(logger); // agregamos el logger solo en desarrollo (ver redux-logger)
  if (!DISABLE_NOTIFICATIONS)
    customMiddleware = customMiddleware.concat(notificationMiddleware); // ejemplo de un middleware custom
  return customMiddleware;
};

const store = configureStore({
  reducer: rootReducer,
  middleware,
});

extraThunkArguments.store = store; // se agrega como otro extra thunk argument el propio store, esto permite acceder a los metodos de suscribre y unsubscribe

export default store;
```

**Parametros**

1. initialState​: Objeto de estado inicial
2. name: Nombre del slice
3. reducers: Objeto de reducers (sincronicos)
4. extraReducers: Objeto de reducers asincronicos y extra matchers (logica compartida de reducers)

#### **Matching Utilities**

Metodos helpers para matchear acciones en `extraReducers` con la forma `builder.addMatcher()`.

1. isAllOf
2. isAnyOf

Especificos para `createAsyncThunk`: 3. isAsyncThunkAction 4. isPending 5. isFulfilled 6. isRejected 7. isRejectedWithValue.

Custom: Se pueden crear custom matchers a demanda para cualquier tipo de accion.

### **createAsyncThunk (async reducers)**

Ejemplo simple:

```javascript
const fetchUserById = createAsyncThunk(
  'users/fetchByIdStatus',
  async (userId, thunkAPI) => {
    const response = await userAPI.fetchById(userId);
    return response.data;
  }
);
```

Ejemplo completo:

```javascript
export const login = createAsyncThunk(
  'auth/login',
  async (payload, { dispatch, rejectWithValue, extra }) => {
    const loginResponse = await extra.API.auth.login(payload);
    if (loginResponse.code !== 200) {
      return rejectWithValue({message:'status code != 200'});
    }
    dispatch(updateToken(loginResponse));
    return loginResponse;
  }
  {
    condition: (payload, { dispatch, getState }) => {
      const { auth } = getState();
      if (auth.failedLogin > 5) {
        return false;
      }
    },
  }
);
```

**Parametros**

1. type: Tipo de "accion" o "nombre" del thunk
2. payloadCreator [callback]: Funcion a ejecutar logica asincrona con sus correspondientes side effects
   1. arg: Valor pasado al despachar el thunk
   2. thunkAPI: Objeto con metodos adicionales como dispatch, getState, extra, rejectWithValue, etc.
3. options: Objeto con configuraciones opcionales:
   1. condition: Callback para condicionar si el thunk debe ser ejecutado

**Retorno**
El metodo retorna un redux thunk action creator estandar, con los correspondientes estados concatenados (ver _LifeCycle_).
Al despacharse, el thunk ejecuta:

1. Despacha accion `pendiente`
2. Ejecuta la logica del payloadCreator y esperes la respuesta de la promesa
3. En funcion del resultado de la promesa, despacha una accion `fulfilled` o `rejected` (ver _rejectWithValue_)
4. Retorna la promesa resuelta con el valor de la respuesta del payloadCreator

**Lifcecylce**
createAsyncThunk genera 3 redux actions creators usando `createAction`: `pending`, `fulfilled` y `rejected`.
Cada uno de estos estados se concatena a la accion retornada por el thunk. Cada accion (para cada estado) contiene un valor unico de `requestId`.

## **Setup para el 99% de los casos**

1. Crear store global
   1. Asignar root reducer
   2. Asignar middlewares
   3. Asignar enhancers
   4. Asignar exta thunk arguments
2. Crear Slice por modulo
   1. Crear objeto de estado inicial
   2. Crear reducers
   3. Crear thunks (async)
   4. Crear extraReducers (asignar matchers de ser necesario)
3. Crear Root Reducer
   1. Importar todos los reducers de todos los slice
   2. Re-exportar el root reducer
   3. Re-exportar todas las actions englobadas (?)
4. Proveer el estado a la app (o porcion de la app)
5. Crear selectors globales y por modulo
   1. Crear selectors globales por slice
   2. Crear selectors memoizables

## Uso en componentes

1. Importar hooks (useSelector, useDispatch), y acciones (actions)
2. Instanciar selector y dispatch
3. Despachar acciones
4. Renderizar el estado

## Para el 1% restante

1. Crear store manualmente
2. Crear reducer
3. Crear action creators
4. Combinar reducers

## Normalizacion de datos

Recomendaciones para la la organizacion y estructura del `state`:

- Mantener la estructura del estado lo mas chata (_shallow_) posible.
- Cada tipo de dato tiene su propia _tabla_ o _slice_. Los datos relacionales pueden modelarse como un base de datos, por lo tanto las mismas "reglas" pueden aplicarse.
- Los registros de la _tabla_ deben ser alamacenados en un objeto, donde el las propiedades (`keys`) son los `id` del objeto, y los valores (`values`) son los datos del registro.
- Toda referencia realizada hacia un registro o item en particular debe ser realizada a traves del `id` del registro
- La tabla debe contener un array de `ids` de los registros para conocer el orden y poder iterar sobre los registros.

Los datos pueden ser normalizados a mano o con el empleo de librerias como [normalizr](https://github.com/paularmstrong/normalizr)

##Ejemplos

### Estado **No** normalizado

```javascript
const blogPosts = [
  {
    id: 'post1',
    author: { username: 'user1', name: 'User 1' },
    body: '......',
    comments: [
      {
        id: 'comment1',
        author: { username: 'user2', name: 'User 2' },
        comment: '.....',
      },
      {
        id: 'comment2',
        author: { username: 'user3', name: 'User 3' },
        comment: '.....',
      },
    ],
  },
  {
    id: 'post2',
    author: { username: 'user2', name: 'User 2' },
    body: '......',
    comments: [
      {
        id: 'comment3',
        author: { username: 'user3', name: 'User 3' },
        comment: '.....',
      },
      {
        id: 'comment4',
        author: { username: 'user1', name: 'User 1' },
        comment: '.....',
      },
      {
        id: 'comment5',
        author: { username: 'user3', name: 'User 3' },
        comment: '.....',
      },
    ],
  },
  // and repeat many times
];
```

### Estado **Normalizado**

```javascript
{
    posts : {
        byId : {
            "post1" : {
                id : "post1",
                author : "user1",
                body : "......",
                comments : ["comment1", "comment2"]
            },
            "post2" : {
                id : "post2",
                author : "user2",
                body : "......",
                comments : ["comment3", "comment4", "comment5"]
            }
        },
        allIds : ["post1", "post2"]
    },
    comments : {
        byId : {
            "comment1" : {
                id : "comment1",
                author : "user2",
                comment : ".....",
            },
            "comment2" : {
                id : "comment2",
                author : "user3",
                comment : ".....",
            },
            "comment3" : {
                id : "comment3",
                author : "user3",
                comment : ".....",
            },
            "comment4" : {
                id : "comment4",
                author : "user1",
                comment : ".....",
            },
            "comment5" : {
                id : "comment5",
                author : "user3",
                comment : ".....",
            },
        },
        allIds : ["comment1", "comment2", "comment3", "comment4", "comment5"]
    },
    users : {
        byId : {
            "user1" : {
                username : "user1",
                name : "User 1",
            },
            "user2" : {
                username : "user2",
                name : "User 2",
            },
            "user3" : {
                username : "user3",
                name : "User 3",
            }
        },
        allIds : ["user1", "user2", "user3"]
    }
}
```

### Ventajas de tener un estado normalizado

- La estructura del estado es mas chata, menos anidamiento.
- Cada registro esta definido en un unico lugar, por lo tanto hay una sola fuente de verdad.
- La logica de los reducers es mas simple ya que no hay que trabajar con objetos anidados.
- La logica para seleccionar, modificar e iterar sobre los registros es simple, O(1).
- Al separar cada _tipo_ de dato en su propia _tabla_, una actualizacion de uno de estos solo implica una modificacion de esa parte del estado. Por lo tanto una menor cantidad de componentes de la UI debe ser renderizado.
- Mantener `selectors` para logicas complejas se hace mas facil.

## Immer y mutacion de estado en reducer

`Immer` es una libreria que simplifica el proceso de escribir logica **inmutable** para modificar el estado.
Redux Toolkit utiliza `immer` automaticamente, por lo tanto es seguro modificar directamente el estado dentro de un reducer.
**Patrones y uso de `immer`**
Immer espera que dentro del reducer se _mute_ el estado existente o se _construya_ un nuevo estado. Pero **NO** ambas a la vez en el mismo reducer.

- Mutar el estado no requiere nigun retorno de la funcion reducer.
- Construir un nuevo estado requiere retornar el nuevo valor del estado.
- Es posible combinar ambos patrones en un mismo reducer. Actualizar el estado de forma _inmutable_ y luego guardar los resultados de forma _mutable_
- **NO** mutar el estado directamente en una arrow function que retorna implicitamente, esto ocasiona un error. Utilizar `void` o `{...}` para evitar el return implicito.
- Puede utilizarse `Object.assign` para mutar varias propiedades del estado.
- Para `resetear` o `reiniciar` el estado el mejor patron es retornar el objeto de estado inicial, o algun otro objecto que sobreescriba el estado actual.

**Actualizar datos anidados**
Con `immer` se puede modificar el estado anidado de objetos y arrays. Sin embargo, esto solo es posible para objetos y arrays, no es posible mutar directamente el estado de un valor primitivo.
Ejemplo:

```javascript
const todosSlice = createSlice({
  name: 'todos',
  initialState: [],
  reducers: {
    brokenTodoToggled(state, action) {
      const todo = state.find((todo) => todo.id === action.payload);
      if (todo) {
        // ❌ ERROR: Immer no puede mutar el estado de un valor primitivo directamente
        let { completed } = todo;
        completed = !completed;
      }
    },
    fixedTodoToggled(state, action) {
      const todo = state.find((todo) => todo.id === action.payload);
      if (todo) {
        // ✅ CORRECTO: El objetivo sigue envuelto por un `proxy` y puede ser mutaddo directamente
        todo.completed = !todo.completed;
      }
    },
  },
});
```

**_OJO_**: Immer no `proxiea` objetos nuevos creados en el reducer. Generalmenete esto no es un problema, pero puede haber algun caso donde se quiera crear/insertar un estado nuevo y luego modificarlo dentro de un mismo reducer.

**Debuggear e inspeccion el estado**
No es posible `console.log(state)` dentro de un reducer, debido a como funciona `immer`.
Redux Toolkit posee una API para simplificar esto:

```javascript
import { current } from '@reduxjs/toolkit';
const todosSlice = createSlice({
  name: 'todos',
  initialState: todosAdapter.getInitialState(),
  reducers: {
    todoToggled(state, action) {
      // ❌ ERROR
      console.log(state);
      // ✅ CORRECTO
      console.log(current(state));
    },
  },
});
```

Es posible ver el estado _original_ y _isDraft_, ver [documentacion](https://immerjs.github.io/immer/original) de `immer` para mas detalles.

## redux-logger

Dependencia de desarollo para debuggear que logea a la consola las acciones despachadas.
**Ejemplo**
![redux-logger-example](https://camo.githubusercontent.com/0eaab0530d60ded442e389d75fe66493c109f84ad6c9c0aacb092395efc68a2e/687474703a2f2f692e696d6775722e636f6d2f43674175486c452e706e67)

## Redux en Next.js

Al tratarse de un framework que utiliza SSR (server side rendering) es necesario sincronizar el estado en el lado `cliente` con el lado `server`. Esto puede realizarse de forma manual, o empleando una libreria como [next-redux-wrapper](https://github.com/kirill-konshin/next-redux-wrapper).

**/store.js**

```javascript
import { configureStore, getDefaultMiddleware } from '@reduxjs/toolkit';
import { createWrapper } from 'next-redux-wrapper';
import rootReducer from '../rootReducer';
​
const setupStore = (context) => configureStore({
  reducer: slice,
  middleware: [...getDefaultMiddleware()],
  // podemos usar la misma logica que antes para crear el store con sus correspondientes middlewares y enhancers
});;
​
const makeStore = (context) => setupStore(context);
​
export const wrapper = createWrapper(makeStore, {
  debug: devMode, // podemos usar una variable de env para habilitar o no el modo debug
});
​
export default wrapper;
```

Al ejecutar el `makeStore` se pasa el context de Next.js al store, este puede ser `NextPageContext`, `AppContext`, `getStaticProps` o `getServerSideProps` dependiendo de que funcion se "envuelva".

**/rootReducer.js**

```javascript
import { combineReducers } from '@reduxjs/toolkit';
import { HYDRATE } from 'next-redux-wrapper';
import data from './data';
import auth from './auth';
​
const rootReducer = (state, action) => {
  switch (action.type) {
    case HYDRATE:
      console.log('HYDRATE');
      return action.payload;
​
    default: {
      const combineReducer = combineReducers({
        auth,
        data,
      });
      return combineReducer(state, action);
    }
  }
};
export default rootReducer;
```

Tambien puede agregarse 'HYDRATE' como extra reducer en cada slice

```javascript
// ...createSlice code
extraReducers: {
        [HYDRATE]: (state, action) => {
            console.log('HYDRATE', state, action.payload);
            return {
                ...state,
                ...action.payload.subject,
            };
        },
    },
```

**/\_App.js**

```javascript
import React from 'react';
​import wrapper from '../store';
​
const App = ({ Component, pageProps }) => {
  return (
    <>
      <Component {...pageProps}/>
    </>
  );
};
​
export default wrapper.withRedux(App); // aplicamos el warpper como HOC al componenete app
```

⚠️ Si bien es posible "envolver" cada pagina individualmenbte, se recomienda utilizar el metodo `wrapper.withRedux()` en todas las pagias a la vez. Esto es para evitar condiciones de carrera (race condition) y el error: 'Cannot update component while rendering another component'.

**/pages/moduleX/[id].js**

```javascript
import React from 'react';
import { useSelector, useStore } from 'react-redux';
import { fetchSubject, selectSubject, wrapper } from 'redux/store';

const Page = (props) => {
  console.log('State on render', useStore().getState(), { props });
  const content = useSelector(selectSomething(props.id));

  if (!content) {
    return <div>RENDERED WITHOUT CONTENT FROM STORE!!!???</div>;
  }

  return (
    <div>
      <h3>{content}</h3>
    </div>
  );
};

export const getServerSideProps = wrapper.getServerSideProps(
  (store) =>
    async ({ params }) => {
      const { id } = params;

      await store.dispatch(fetchSubject(id)); // o puede usarse hooks de `useDispatch`

      return {
        props: {
          id,
        },
      };
    }
);

export default Page;
```

**getStaticProps**

```javascript
// pages/pageName.js
import React from 'react';
import { useSelector } from 'react-redux';
import { wrapper } from 'redux/store';

export const getStaticProps = wrapper.getStaticProps(
  (store) =>
    ({ preview }) => {
      console.log('2. Page.getStaticProps uses the store to dispatch things');
      store.dispatch({
        type: 'TICK',
        payload: 'was set in other page ' + preview,
      });
    }
);

const Page = () => {
  const { tick } = useSelector((state) => state);
  return <div>{tick}</div>;
};

export default Page;
```

⚠️ Cada vez que el usuario navega o abre alguna pagina con `getStaticProps`, se despacha la accion `HYDRATE`. El `payload` de esta accion contiene el `state` del server al momento de ejecutarse el SSR, **NO** contiene el estado del lado del cliente. Por lo tanto es importante combinar (merge) ambos lados del estado correctamente.

**getServerSideProps**

```javascript
// pages/pageName.js
import React from 'react';
import {useSelector} from 'react-redux';
import {wrapper, State} from 'redux/store';

export const getServerSideProps = wrapper.getServerSideProps(store =>
    ({req, res, ...etc}) => {
        console.log('2. Page.getServerSideProps uses the store to dispatch things');
        store.dispatch({type: 'TICK', payload: 'was set in other page'});
    }
);

// Page itself is not connected to Redux Store, it has to render Provider to allow child components to connect to Redux Store
const Page: NextPage = ({tick}) => (
    const { tick } = useSelector((state) => state);
    <div>{tick}</div>
);

export default (Page);
```

⚠️ Cada vez que el usuario navega o abre alguna pagina con `getServerSideProps`, se despacha la accion `HYDRATE`. El `payload` de esta accion contiene el `state` del server al momento de ejecutarse el SSR, **NO** contiene el estado del lado del cliente. Por lo tanto es importante combinar (merge) ambos lados del estado correctamente.

## Persistir el estado

Accion de persistir el estado en memoria (local storage) del lado cliente y/o server. Puede realizarse de forma manual, lo que implica mantener sincronizado el estado entre lo persisito y las actualizaciones que se realizan. La libreria [redux-persist](https://github.com/rt2zz/redux-persist) simplifica el proceso de manera significativa.

## **Documentacion**

- [Ejemplo oficial nextjs](https://github.com/vercel/next.js/tree/canary/examples/with-redux)
- [Documentacion oficial next-redux-wrapper](https://github.com/kirill-konshin/next-redux-wrapper)
- [Documentacion ofical Redux](https://redux.js.org/)
- [Documentacion ofical Redux Toolkit](https://redux-toolkit.js.org/)
- [Resumen Redux + ReduxToolkit](https://www.valentinog.com/blog/redux/)
