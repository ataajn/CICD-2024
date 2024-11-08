FROM python:3.12.0rc3-bullseye
WORKDIR /app
COPY . /app/
RUN pip install -r requirements.txt
RUN DEBIAN_FRONTEND=noninteractive curl -sSL https://get.docker.com/ | sh
CMD ["python", "/app/main.py"]