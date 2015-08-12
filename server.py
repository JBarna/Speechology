import BaseHTTPServer, SimpleHTTPServer
import ssl
 
httpd = BaseHTTPServer.HTTPServer(('localhost', 8080), SimpleHTTPServer.SimpleHTTPRequestHandler)
httpd.socket = ssl.wrap_socket (httpd.socket, certfile='./keys/cert.pem', keyfile='./keys/key.pem', server_side=True)
httpd.serve_forever()