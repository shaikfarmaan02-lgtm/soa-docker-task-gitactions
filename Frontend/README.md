# Software License Management

React single-page frontend for the Spring Boot license API.

## Run locally

1. Start the Spring Boot backend on `http://localhost:8081`.
2. From this directory, run:

   ```sh
   npm install
   npm run dev
   ```

3. Open the local URL printed by Vite (usually `http://localhost:5173`).

The API client uses `/api` by default. Vite forwards `/api/*` to `http://localhost:8081/*`, so the backend does not need to enable browser CORS for local development. To use a different API URL, copy `.env.example` to `.env.local`, set `VITE_API_BASE_URL`, and restart Vite. The value is the API base path, before `/Add`, `/DisplayAll`, and the other endpoint paths.

## CRUD operations

- **Create:** Enter a license key, software name, expiry date, and active status, then select **Add License**. The database generates the ID; the create request sends only `licenseKey`, `softwareName`, `expiryDate`, and `active`.
- **Read:** Existing records load in the table. Use **Refresh** to fetch them again.
- **Update:** Select **Edit**, change the fields, and select **Update License**.
- **Delete:** Select **Delete** and confirm the prompt.

Successful create, update, and delete operations refresh the table. Required fields are validated in the form, and backend/network errors are shown in an alert.

## Production Docker image

Build and run the Nginx-served production app:

```sh
docker build -t software-license-frontend .
docker run --rm -p 8080:80 software-license-frontend
```

Open `http://localhost:8080`. Nginx serves the production build, falls back to `index.html` for frontend routes, and proxies `/api/*` to the backend. The default `BACKEND_URL` is `http://host.docker.internal:8081` for a backend running on the Docker host. Set `-e BACKEND_URL=http://your-backend-host:8081` when running the container if the backend has a different reachable address. When the backend is another container, use its service name and attach both containers to the same Docker network.
