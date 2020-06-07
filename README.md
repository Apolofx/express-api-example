# Deploy Node.js server

Estado: in-progress

## Objetivos

Deployar un servidor muy sencillo hecho con Express.js que va a correr en un entorno de Node en Heroku.

## Requerimientos

- **Heroku accout**
- **Heroku CLI** instalado
- **Node actualizado** a la ultima version. (al dia de hoy 31/5/20, es v12.16.3)
- **Postman** (opcional)
- **npm**
- **GIT**

## Crear modulo npm

1. `mkdir demo`
2. `npm init -y`  
3. `git init`
4. Preparar scafolding: 

    ```
    package.json
    ./src/
    ./build/
    ```

5. **OPCIONAL:** Preparar entorno para usar ES6 —> `babel-env`. Babel-env es solo el alias de un bash-script para instalar las dependencias necesarias de babel y crear su archivo de configuracion en un solo paso. Es el equivalente a hacer lo siguiente: 

    ```json
    npm i --save-dev @babel/core @babel/cli @babel/preset-env
    echo "{\"presets\" : [ \"@babel/env\" ]}" > .babelrc
    ```

6. **OPCIONAL:** Agregar script para transpilar el codigo con babel. Le decimos que todo lo que esta en la carpeta `src` lo compile y guarde en `build` siempre y cuando se haya modificado algun archivo (`--watch`).

    ```json
    "babel": "babel src --watch --out-dir build "
    ```

7. Instalar **nodemon**
Nodemon nos va a servir para no tener que reiniciar el servidor cada vez que modifiquemos un archivo del proyecto.
1. `npm install --save-dev nodemon`
2. Modificamos el script `dev` de la siguiente manera

    ```json
    "scripts" : {
    ...
    "dev": "nodemon -r dotenv/config ./build/index.js" // -r significa require. 
    }
    ```

8. Instalar **dotenv:** 
El paquete de npm dotenv nos permite leer un archivo de formato `.env` y parsear o extraer todas sus variables en un formato de key:value para que lo podamos leer como un objeto con JavaScript. 
Instalar dotenv como devDependency `npm i --save-dev dotenv`
9. **Configurar variables de entorno:**
Queremos que nuestro codigo pueda leer las variables de entorno con `process.env.VARIABLE_ENTORNO` independientemente de si estamos corriendo la app localmente o en produccion. Para esto vamos a crear un archivo `.env` y adentro vamos a escribir todas las variables de entorno que necesitemos a lo largo de la app en dev. Este archivo `.env` contiene las variables de entorno que le vamos a configurar para probar la app en development, que no necesariamente van a ser las mismas que en produccion, de todas formas **lo vamos a ignorar del control de versiones.** 
Para poder contar con las mismas variables en el entorno de produccion, vamos a tener que copiar todas ellas a las variables de entorno de heroku, y asignarles los values que sean requeridos en prod.

    ```bash
    echo '.env' >> .gitignore
    ```

10. Para poder independizarnos de requerir dotenv en dependencies, lo vamos a requerir desde el mismo comando en que corremos el server con node, de esta manera, al hacer el pre-build el paquete dotenv busca el primer archivo `.env` que encuentre y ejecuta su metodo `dotenv.config()` que se va a encargar de agregar esas variables de entorno y tenerlas disponibles en tiempo de ejecucion.
Agregamos un script al package.json para correr el servidor en dev utilizando las variables de entorno locales.

    ```json
    "scripts" : {
    ...
    "dev": "node -r dotenv/config ./build/index.js" // -r significa require. 
    }
    ```

11. Vamos a instalar los paquetes de npm necesarios para levantar el servidor y hacer las peticiones http. 

    **Axios** es una API para enviar y recibir peticiones http.

    **Express** es el framework que nos va a permitir manejar esas peticiones 

    ```bash
    npm install axios express
    ```

## Preparar App

1. Tenemos que Instalar **heroku-cli** y crear una App en nuestra cuenta.

    ```bash
    sudo snap install --classic heroku
    heroku login 
    heroku create
    ```

    Cuando hacemos un heroku create, automaticamente se crea un **git remote** llamado **heroku**, asociado al repositorio local en el cual creamos la app. Si no tenemos un repositorio de git creado al momento de haber creado la app, vamos a tener que asociarlos manualmente despues.

2. Definir un **ProcFile**

    El ProcFile es un archivo en el directorio raiz de nuestra app que le va a decir a Heroku que comando ejecutar para inicializar la app. Para una aplicacion web que va a interactuar con peticiones HTTP, vamos a usar el tipo de proceso **web**, y definir el comando `node index.js`

    para inicializarla. Index.js en este caso es nuestro entry point o archivo raiz en donde se manejan todas las requests por Express. 

    Nuestro archivo se tiene que llamar siempre Procfile, sin ninguna extension, y va a quedar asi:

    ```bash
    web: node server.js
    ```

 3. **package.json →** chequear que todas las dependencias esten bien, y la version de Node. 

```json
"engines": {

"node": "<nuestra-version-de-node>" //Ej: "v12.x"

}
```

 4. Una vez que hicimos todos los cambios y nuestra app funciona como queremos localmente, 

entonces la deployamos al repo de heroku.

```bash
git push heroku master
```

5. Si queremos abrirla para probarla

```bash
heroku open
```

## **Procfile format**

Un Procfile declara sus procesos en distintas lineas cada una con el siguiente formato:

```
<process type>: <command>
```

- `<process type>` is an alphanumeric name for your command, such as `web`, `worker`, `urgentworker`, `clock`, and so on.
- `<command>` indicates the command that every dyno of the process type should execute on startup, such as `rake jobs:work`.

## Dynos

Los dynos son como microservicios que se encargan de correr el codigo que le pasamos en el Procfile. En una cuenta free, tenemos 1 dyno para correr codigo, y ese dyno despues de un tiempo determinado sin recibir requests se va a dormir, por eso es que la primer request posterior a un sleep va a tener un tiempo de response un poco mas prolongado hasta despertar el servicio, las siguientes van a ser mas rapidas, hasta que vuelva a estar inactivo.

Podemos escalar la cantidad de dynos activos con el comando `heroku ps:scale web=1` donde '1' es el numero de dynos al que queremos escalar.

## Variables de Entorno

Podemos crear un archivo `.env` en donde almacenar datos como constantes globales al programa o claves de encriptacion. En el codigo podemos acceder a estas variables utilizando `process.env.VARIABLE` donde VARIABLE es el nombre de la variable a la que queremos acceder.

Ademas, Heroku tiene sus propias variables de entorno a las cuales podemos acceder con:

 

```bash
heroku config:set NOMBRE_VARIABLE = <valor>
```

De este modo, tenemos separadas las variables de entorno de **produccion** con `config:set` y las de **dev** en el archivo .env. 

Debemos agregar **.env** a .gitignore, ya que no tendriamos que tener claves o informacion sensible trackeada en nuestro control de versiones. Tienen que ser variables de locales al entorno de ejecucion. Heroku ya tiene su propio **.env** en su entorno. 

## Links relevantes

- [https://babeljs.io/docs](https://babeljs.io/docs/en/babel-cli)
- [dotenv tutorial](https://medium.com/the-node-js-collection/making-your-node-js-work-everywhere-with-environment-variables-2da8cdf6e786)
-