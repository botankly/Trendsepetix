import subprocess
import os

# Define directories
root_dir = r"C:\Users\KLAY\Desktop\TRENDSEPETİX"
frontend_dir = r"C:\Users\KLAY\Desktop\TRENDSEPETİX\frontend"

# Start backend
backend_cmd = [os.path.join(root_dir, "venv", "Scripts", "python.exe"), "manage.py", "runserver", "127.0.0.1:8000"]
p_backend = subprocess.Popen(backend_cmd, cwd=root_dir, creationflags=0x00000008) # 0x00000008 is DETACHED_PROCESS

# Start frontend
frontend_cmd = ["cmd.exe", "/c", "npm", "run", "dev", "--", "--host", "127.0.0.1"]
p_frontend = subprocess.Popen(frontend_cmd, cwd=frontend_dir, creationflags=0x00000008)

print("Started both servers successfully as detached processes!")
print("Backend PID:", p_backend.pid)
print("Frontend PID:", p_frontend.pid)
