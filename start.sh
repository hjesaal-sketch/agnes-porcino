#!/bin/bash
# Updated 2026-02-19
pip install -r backend/requirements.txt
cd backend
python -m uvicorn main:app --host 0.0.0.0 --port $PORT
