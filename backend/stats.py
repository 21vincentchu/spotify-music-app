from flask import Blueprint, session, redirect
import spotipy
from spotipy.oauth2 import SpotifyOAuth
import os

stats_bp = Blueprint('stats', __name__)


@stats_bp.route('/stats')
def stats():
    token_info = session.get('token_info')
    if not token_info:
        return redirect('/')

    sp_oauth = SpotifyOAuth(
        client_id=os.getenv("SPOTIFY_CLIENT_ID"),
        client_secret=os.getenv("SPOTIFY_CLIENT_SECRET"),
        redirect_uri="http://localhost:8080/callback",
        scope='user-read-private user-read-email user-top-read user-read-recently-played user-read-playback-state user-read-currently-playing user-read-playback-position user-library-read user-library-modify playlist-read-private playlist-read-collaborative playlist-modify-public playlist-modify-private user-follow-read user-follow-modify user-modify-playback-state streaming app-remote-control ugc-image-upload'
    )

    if sp_oauth.is_token_expired(token_info):
        token_info = sp_oauth.refresh_access_token(token_info['refresh_token'])
        session['token_info'] = token_info

    sp = spotipy.Spotify(auth=token_info['access_token'])

    user_profile = sp.current_user()

    ##top 50 artists and songs of week

    top_artists_week = sp.current_user_top_artists(limit=50, time_range='short_term')


    top_tracks_week = []
    batch_size = 50
    offset = 0

    while True:
        batch = sp.current_user_top_tracks(limit=batch_size, offset=offset, time_range='short_term')
        top_tracks_week.extend(batch['items'])
        if len(batch['items']) < batch_size:
            break
        offset += batch_size


    ##top 50 artists and songs of month
    top_artists_month = sp.current_user_top_artists(limit=50, time_range='medium_term')
   
    top_tracks_month = []
    batch_size3 = 50
    offset3 = 0

    while True:
        batch3 = sp.current_user_top_tracks(limit=batch_size3, offset=offset2, time_range='medium_term')
        top_tracks_month.extend(batch3['items'])
        if len(batch2['items']) < batch_size3:
            break
        offset3 += batch_size3

    ##top 50 artists and songs for last year
    top_artists_year = sp.current_user_top_artists(limit=50, time_range='long_term')
    
    top_tracks_year = []
    batch_size2 = 50
    offset2 = 0

    while True:
        batch2 = sp.current_user_top_tracks(limit=batch_size2, offset=offset2, time_range='long_term')
        top_tracks_year.extend(batch2['items'])
        if len(batch2['items']) < batch_size2:
            break
        offset2 += batch_size2



    ##current artists the user follows
    followed_artists = sp.current_user_followed_artists(limit=20, after=None)
    print(followed_artists)

    ##current user saved albums

    ##list user playlists

    playlist = sp.user_playlists(user_profile['id'], limit=50, offset=0)

    html = "<h1>Your Spotify Stats</h1>"

    # Top Artists
    html += "<h2>Top Artists (Week)</h2><ul>"
    for artist in top_artists_week['items']:
        html += f"<li>{artist['name']}</li>"
    html += "</ul>"

    html += "<h2>Top Tracks (Week)</h2><ul>"
    for track in top_tracks_week:
        html += f"<li>{track['name']} by {track['artists'][0]['name']}</li>"
    html += "</ul>"

    html += "<h2>Top Artists (Month)</h2><ul>"
    for artist in top_artists_month['items']:
        html += f"<li>{artist['name']}</li>"
    html += "</ul>"

    html += "<h2>Top Tracks (Month)</h2><ul>"
    for track in top_tracks_month:
        html += f"<li>{track['name']} by {track['artists'][0]['name']}</li>"
    html += "</ul>"

    html += "<h2>Top Artists (Year)</h2><ul>"
    for artist in top_artists_year['items']:
        html += f"<li>{artist['name']}</li>"
    html += "</ul>"

    html += "<h2>Top Tracks (Year)</h2><ul>"
    for track in top_tracks_year:
        html += f"<li>{track['name']} by {track['artists'][0]['name']}</li>"
    html += "</ul>"

    # Followed Artists
    html += "<h2>Followed Artists</h2><ul>"
    for artist in followed_artists['artists']['items']:
        html += f"<li>{artist['name']}</li>"
    html += "</ul>"

    # User Playlists
    html += "<h2>Your Playlists</h2><ul>"
    for pl in playlist['items']:
        html += f"<li>{pl['name']}</li>"
    html += "</ul>"

    html += "<p><a href='/'>Back to Profile</a></p>"
    return html