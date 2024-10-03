FROM python:3.12.0rc3-bullseye
WORKDIR /app
COPY . /app/
EXPOSE 8000
RUN pip install -r requirements.txt
CMD ["python", "/app/main.py"]
