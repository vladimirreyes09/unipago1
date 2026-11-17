# Prueba técnica

## Cómo ejecutar

Solo debes escribir:

```bash
docker compose up
```

Ambos servicios (frontend y backend) subirán automáticamente. El cliente se encuentra en el puerto `5173`:

- http://localhost:5173

Si deseas leer las decisiones técnicas, puedes consultarlas en el archivo `decisiones_tecnicas.txt`.


#Test
```bash
```
```bash
npm run start
```

(Recomendado) Correr los n2n test dentro de un contenedor

```bash
docker compose -f docker-compose.test.yml  up --abort-on-container-exit
```

Quedo a la expectativa del feedback.

Notas importantes: 
Me faltó conectar a postgres, voy a ver si lo hago antes de que lo revisen el proyecto, tomé la decision de no conectar a postgres porque yá he consumido mucho tiempo.
Por la misma razón voy a incluir todos los últimos archivos que modifiqué en los últimos cambios en el mismo commit.
