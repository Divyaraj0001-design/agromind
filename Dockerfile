# Single-container deploy: Node backend + Python ML service together.
FROM node:20-slim

# Python for the ML microservice
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 python3-pip python3-venv \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Backend deps
COPY backend/package*.json backend/
RUN cd backend && npm install --omit=dev

# ML service deps (isolated venv so pip doesn't fight the system Python)
COPY ml-service/requirements.txt ml-service/
RUN python3 -m venv /opt/venv \
    && /opt/venv/bin/pip install --no-cache-dir -r ml-service/requirements.txt

# App code
COPY backend/ backend/
COPY ml-service/ ml-service/

ENV PATH="/opt/venv/bin:$PATH"
ENV ML_SERVICE_URL=http://localhost:8000
ENV NODE_ENV=production

COPY start.sh .
RUN chmod +x start.sh

EXPOSE 5050
CMD ["./start.sh"]
