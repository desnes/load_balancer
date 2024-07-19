# load_balancer
Se especifican los pasos para levantar un balanceador de carga con un aplicación de node.js
### Paso 1: Configurar el proyecto
1. **Crear una carpeta para tu proyecto**:
   ```bash
   mkdir myapp
   cd myapp
   ```

2. **Inicializar un proyecto Node.js**:
   ```bash
   npm init -y
   ```
### Paso 2: Instalar Express
Express es un framework minimalista para Node.js que facilita la creación de servidores web.
```bash
npm install express
```

### Paso 3: Crear el servidor
1. **Crear un archivo `app.js`**:
   ```javascript
   const express = require('express');
   const app = express();
   const port = 3000;

   app.get('/', (req, res) => {
       res.send('Hello, World!');
   });

   app.listen(port, () => {
       console.log(`Server is running at http://localhost:${port}`);
   });
   ```

### Paso 4: Ejecutar la aplicación
1. **Iniciar el servidor**:
   ```bash
   node app.js
   ```

2. **Acceder a la aplicación**:
   Abre tu navegador y ve a [http://localhost:3000](http://localhost:3000). Deberías ver el mensaje "Hello, World!".

## Despliegue del Balanceador de Carga con Nginx

### Paso 5: Preparar el Entorno
1. **Instalar Docker**: Asegúrate de tener Docker instalado en tu máquina. Puedes descargarlo desde [Docker](https://www.docker.com/get-started).
2. **Crear una Red Docker**: 
   ```bash
   docker network create my_network
   ```

### Paso 6: Configurar los nodos 
1. **Crear un Dockerfile para los nodos**:
   ```dockerfile
      FROM node:14

      FROM node:14
      WORKDIR /usr/src/app
      COPY package*.json ./
      RUN npm install
      COPY . .
      EXPOSE 3000
      CMD ["node", "app.js"]
   
   ```
2. **Construir y ejecutar los contenedores**:  
   a. **Nodo 1**

   ```bash

   docker build -t my_node_1 .
   docker run -d --name app1 --network load_balancer_network -p 3001:3000 my_node_1

   ```
   b.  **Nodo 2**
   ```bash

   docker build -t my_node_2 .
   docker run -d --name app2 --network load_balancer_network -p 3002:3000 my_node_2

   ```
   c.  **Nodo 3**
   ```bash

   docker build -t my_node_3 .
   docker run -d --name app3 --network load_balancer_network -p 3003:3000 my_node_3

   ```

#### Paso 7: Configurar Nginx como Balanceador de Carga
1. **Crear un archivo de configuración `nginx.conf`**:
   ```nginx
      http {
      upstream nodeapp {
         server app1:3000 weight=2;   # Este servidor recibe más solicitudes
         server app2:3000 weight=1;
         server app3:3000 weight=1;
      }

      server {
         listen 80;  # Nginx escucha en el puerto 80

         location / {
               proxy_pass http://nodeapp;
               proxy_set_header Host $host;
               proxy_set_header X-Real-IP $remote_addr;
               proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
         }
      }
   }

   events {}
   ```
2. **Crear un Dockerfile para Nginx**:
   ```dockerfile
   # Use Nginx image from Docker Hub
   FROM nginx:alpine

   # Remove default Nginx configuration
   RUN rm /etc/nginx/conf.d/default.conf

   # Copy custom Nginx config file into image
   COPY nginx.conf /etc/nginx/nginx.conf

   # Expose port 80
   EXPOSE 80

   ```

3. **Crear un docker-compose.yml para Nginx**:
   ```
   version: '3.7'
   services:
   nginx:
      build:
         context: .
         dockerfile: Dockerfile.nginx
      ports:
         - "9000:80"  # Exponiendo el puerto 80 del contenedor en el puerto 9000 del host
      networks:
         - load_balancer_network

   networks:
   load_balancer_network:
      external: true
   ```
4. **Construir y ejecutar el contenedor de Nginx**:
   ```bash
   docker-compose up --build -d
   ```

### Pruebas de Rendimiento con Apache Bench

#### Paso 8: Realizar Pruebas con Apache Bench
1. **Instalar Apache Bench**: Si no lo tienes instalado, puedes hacerlo con:
   ```bash
   sudo apt-get install apache2-utils
   ```

2. **Ejecutar las Pruebas**:
   - **Prueba 1**: 1000 peticiones con 10 concurrentes
     ```bash
     ab -n 1000 -c 10 http://localhost/
     ```
   - **Prueba 2**: 2000 peticiones con 20 concurrentes
     ```bash
     ab -n 2000 -c 20 http://localhost/
     ```
   - **Prueba 3**: 3000 peticiones con 30 concurrentes
     ```bash
     ab -n 3000 -c 30 http://localhost/
     ```
   - **Prueba 4**: 4000 peticiones con 40 concurrentes
     ```bash
     ab -n 4000 -c 40 http://localhost/
     ```
   - **Prueba 5**: 5000 peticiones con 50 concurrentes
     ```bash
     ab -n 5000 -c 50 http://localhost/
     ```