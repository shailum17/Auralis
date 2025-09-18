FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install Python dependencies
COPY apps/ml-service/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy source code
COPY apps/ml-service/src ./src/
COPY apps/ml-service/tests ./tests/

# Create models directory
RUN mkdir -p models

EXPOSE 8001

CMD ["python", "src/main.py"]