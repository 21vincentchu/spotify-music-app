from flask import Blueprint, request, jsonify, session

profile_bp = Blueprint('profile_bp', __name__, url_prefix='/api/profile')
