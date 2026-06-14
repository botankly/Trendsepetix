import subprocess
import os
import time
import socket

root_dir = r"C:\Users\KLAY\Desktop\TRENDSEPETİX"
frontend_dir = r"C:\Users\KLAY\Desktop\TRENDSEPETİX\frontend"

def check_port(host, port):
    for af in [socket.AF_INET, socket.AF_INET6]:
        try:
            s = socket.socket(af, socket.SOCK_STREAM)
            s.settimeout(1.0)
            if af == socket.AF_INET6:
                s.connect((host, port, 0, 0))
            else:
                s.connect((host, port))
            s.close()
            return f"Success (IPv{6 if af == socket.AF_INET6 else 4})"
        except Exception as e:
            pass
    return "Failed"

# We run them and write output to a file immediately
print("Starting backend...")
with open(os.path.join(root_dir, 'backend_stdout.log'), 'w') as out, open(os.path.join(root_dir, 'backend_stderr.log'), 'w') as err:
    p = subprocess.Popen([os.path.join(root_dir, "venv", "Scripts", "python.exe"), "manage.py", "runserver", "127.0.0.1:8000"],
                         cwd=root_dir, stdout=out, stderr=err)
    
    print("Starting frontend...")
    with open(os.path.join(root_dir, 'frontend_stdout.log'), 'w') as out2, open(os.path.join(root_dir, 'frontend_stderr.log'), 'w') as err2:
        p2 = subprocess.Popen(["cmd.exe", "/c", "npm", "run", "dev", "--", "--host", "127.0.0.1"],
                             cwd=frontend_dir, stdout=out2, stderr=err2)
        
        print("Waiting 5 seconds for servers to start...")
        time.sleep(5)
        
        print("Checking ports...")
        print("Port 8000:", check_port("127.0.0.1", 8000))
        print("Port 5173 (127.0.0.1):", check_port("127.0.0.1", 5173))
        print("Port 5173 (localhost):", check_port("localhost", 5173))
        
        print("Backend poll:", p.poll())
        print("Frontend poll:", p2.poll())
