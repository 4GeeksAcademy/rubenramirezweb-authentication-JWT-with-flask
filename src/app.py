"""
This module takes care of starting the API Server, Loading the DB and Adding the endpoints
"""
import os
from flask import Flask, request, jsonify, url_for, send_from_directory
from flask_migrate import Migrate
from flask_swagger import swagger
from api.utils import APIException, generate_sitemap
from api.models import db, User
from api.routes import api      # Esto importa el blueprint
from api.admin import setup_admin
from api.commands import setup_commands
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from flask_cors import CORS

# from models import Person

ENV = "development" if os.getenv("FLASK_DEBUG") == "1" else "production"
static_file_dir = os.path.join(os.path.dirname(
    os.path.realpath(__file__)), '../public/')
app = Flask(__name__)
app.config["JWT_SECRET_KEY"] = "nuestra_clave_secreta"
jwt = JWTManager(app)
CORS(app)
app.url_map.strict_slashes = False

# database condiguration
db_url = os.getenv("DATABASE_URL")
if db_url is not None:
    app.config['SQLALCHEMY_DATABASE_URI'] = db_url.replace(
        "postgres://", "postgresql://")
else:
    app.config['SQLALCHEMY_DATABASE_URI'] = "sqlite:////tmp/test.db"

app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
MIGRATE = Migrate(app, db, compare_type=True)
db.init_app(app)

# add the admin
setup_admin(app)

# add the admin
setup_commands(app)

# Add all endpoints form the API with a "api" prefix
app.register_blueprint(api, url_prefix='/api')

# Handle/serialize errors like a JSON object


@app.errorhandler(APIException)
def handle_invalid_usage(error):
    return jsonify(error.to_dict()), error.status_code

# generate sitemap with all your endpoints


@app.route('/')
def sitemap():
    if ENV == "development":
        return generate_sitemap(app)
    return send_from_directory(static_file_dir, 'index.html')

# any other endpoint will try to serve it like a static file


@app.route('/<path:path>', methods=['GET'])
def serve_any_other_file(path):
    if not os.path.isfile(os.path.join(static_file_dir, path)):
        path = 'index.html'
    response = send_from_directory(static_file_dir, path)
    response.cache_control.max_age = 0  # avoid cache memory
    return response


@app.route("/signup", methods=["POST"])
def handle_signup():
    try:
        data = request.get_json(silent=True)
        print("Data del body", data)

        if not data or not data.get("email") or not data.get("password"):
            return jsonify({"error": "Datos inválidos"}), 400
    
        # Esto verifica si ya existe un usuario con el email
        if db.session.execute(db.select(User).filter_by(email=data["email"])).scalar_one_or_none():
            return jsonify({"error": "Usuario ya existe"}), 409

        # Crea un Nuevo Usuario
        user = User(email=data["email"], password=data["password"], is_active=True)
        db.session.add(user)
        db.session.commit()

        access_token = create_access_token(
            identity=str(user.id))
        return jsonify({"message": "Usuario registrado", "access_token": access_token}), 201

        
        # return jsonify({"ok": True, "msg": "Login exitoso...", "access_token": access_token}), 200
        # return jsonify({"ok": True, "msg": "Usuario creado correctamente"}), 201
    except Exception as e:
        print("Error: ", str(e))
        # Método que revierte la transacción actual en curso en SQLAlchemy. Si no hay ninguna transacción activa, el método no hace nada. 
        db.session.rollback()
        return jsonify({"ok": False, "msg": str(e)})


@app.route('/login', methods=['POST'])
def handle_login():
    try:
        data = request.get_json(silent=True)
        # Buscar usuario en la base de datos, por correo electrónico (Ejemplo el usuario tiene id 1)
        user = db.session.execute(db.select(User).filter_by(email=data["email"])).scalar_one_or_none()
        print(user)
        if not user or user.password != data["password"]:
            return jsonify({"msg": "Credenciales incorrectas"}), 401

        # Esto agrega informacion adicional al token
        claims = {"role": "admin", "otra_informacion": {
            "data": "info", "info": "Más Info"}}
        
        # Si todo lo demas es exitoso... entonces creamos el token
        access_token = create_access_token(
            identity=str(user.id), additional_claims=claims)
        return jsonify({"ok": True, "msg": "Login exitoso...", "access_token": access_token}), 200
    except Exception as e:
        print("Error: ", str(e))
        db.session.rollback()
        return jsonify({"ok": False, "msg": str(e)})
    
# Ruta protegida
@app.route("/private", methods=["PUT"])
@jwt_required()
def update_private():
    user_id = get_jwt_identity()
    user = db.session.get(User, user_id)
    data = request.get_json(silent=True)

    user.email = data.get("email", user.email)
    db.session.commit()
    return jsonify({"message": "Perfil actualizado"}), 200


@app.route("/private", methods=["GET"])
@jwt_required()
def private():
    user_id = get_jwt_identity()
    user = db.session.get(User, user_id)
    return jsonify(user.serialize()), 200


# this only runs if `$ python src/app.py` is executed
if __name__ == '__main__':
    PORT = int(os.environ.get('PORT', 3001))
    app.run(host='0.0.0.0', port=PORT, debug=True)
