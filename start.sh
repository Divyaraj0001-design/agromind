#!/bin/bash
set -e

# Start the ML microservice in the background
cd /app/ml-service
uvicorn main:app --host 0.0.0.0 --port 8000 &

# Give it a moment to boot before the backend starts serving traffic
sleep 2

# Run the Express backend as the container's main process
cd /app/backend
exec node server.js
