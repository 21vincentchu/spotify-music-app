import React from "react";
import "../../styles/Mobile.css";

import axios from 'axios';
import LoadingSpinner from '../../components/shared/LoadingSpinner';

import SongComponent from "../../components/shared/SongComponent";
import { useEffect, useState } from 'react';


const HomeMobile = () => {
  return (
    <div className="mobile-content">
      {/* ===== Main Page Header ===== */}
      <h1 className="home-header">Welcome to Reverb</h1>

      <div className="home-page">
        {/* ===== Featured Recommendations ===== */}
        <div className="scroll-section">
            <section className="home-featured">
                      <h2>Top Songs</h2>
                      <p className="subtext">Songs You've Been Loving</p>

                      <div className="grid-wrapper">
                        <div className="responsive-grid">
                          <div className="song-info-box">
                            <div className="circle"></div>
                            <div className="song-text">
                              <p className="song-title">Lost in Japan</p>
                              <p className="song-artist">Shawn Mendes</p>
                              <p className="song-genre">Pop</p>
                            </div>
                          </div>

                          <div className="song-info-box">
                            <div className="circle"></div>
                            <div className="song-text">
                              <p className="song-title">Lost in Japan</p>
                              <p className="song-artist">Shawn Mendes</p>
                              <p className="song-genre">Pop</p>
                            </div>
                          </div>

                          <div className="song-info-box">
                            <div className="circle"></div>
                            <div className="song-text">
                              <p className="song-title">Levitating</p>
                              <p className="song-artist">Dua Lipa</p>
                              <p className="song-genre">Dance</p>
                            </div>
                          </div>
                          <div className="song-info-box">
                            <div className="circle"></div>
                            <div className="song-text">
                              <p className="song-title">Heat Waves</p>
                              <p className="song-artist">Glass Animals</p>
                              <p className="song-genre">Indie Pop</p>
                            </div>
                          </div>
                          <div className="song-info-box">
                            <div className="circle"></div>
                            <div className="song-text">
                              <p className="song-title">Heat Waves</p>
                              <p className="song-artist">Glass Animals</p>
                              <p className="song-genre">Indie Pop</p>
                            </div>
                          </div>
                          <div className="song-info-box">
                            <div className="circle"></div>
                            <div className="song-text">
                              <p className="song-title">Levitating</p>
                              <p className="song-artist">Dua Lipa</p>
                              <p className="song-genre">Dance</p>
                            </div>
                          </div>
                          <div className="song-info-box">
                            <div className="circle"></div>
                            <div className="song-text">
                              <p className="song-title">Levitating</p>
                              <p className="song-artist">Dua Lipa</p>
                              <p className="song-genre">Dance</p>
                            </div>
                          </div>
                          <div className="song-info-box">
                            <div className="circle"></div>
                            <div className="song-text">
                              <p className="song-title">Levitating</p>
                              <p className="song-artist">Dua Lipa</p>
                              <p className="song-genre">Dance</p>
                            </div>
                          </div>
                          <div className="song-info-box">
                            <div className="circle"></div>
                            <div className="song-text">
                              <p className="song-title">Levitating</p>
                              <p className="song-artist">Dua Lipa</p>
                              <p className="song-genre">Dance</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </section>

        </div>
        

        {/* ===== Friends Say Section ===== */}
        
        <div className="scroll-section">
            <section className="home-featured">
                      <h2>Featured Recomendations</h2>
                      <p className="subtext">Your friends want you to listen to...</p>

                      <div className="grid-wrapper">
                        <div className="responsive-grid">
                          <div className="song-info-box">
                            <div className="circle"></div>
                            <div className="song-text">
                              <p className="song-title">Lost in Japan</p>
                              <p className="song-artist">Shawn Mendes</p>
                              <p className="song-genre">Pop</p>
                            </div>
                          </div>

                          <div className="song-info-box">
                            <div className="circle"></div>
                            <div className="song-text">
                              <p className="song-title">Levitating</p>
                              <p className="song-artist">Dua Lipa</p>
                              <p className="song-genre">Dance</p>
                            </div>
                          </div>
                          <div className="song-info-box">
                            <div className="circle"></div>
                            <div className="song-text">
                              <p className="song-title">Heat Waves</p>
                              <p className="song-artist">Glass Animals</p>
                              <p className="song-genre">Indie Pop</p>
                            </div>
                          </div>
                          <div className="song-info-box">
                            <div className="circle"></div>
                            <div className="song-text">
                              <p className="song-title">Heat Waves</p>
                              <p className="song-artist">Glass Animals</p>
                              <p className="song-genre">Indie Pop</p>
                            </div>
                          </div>
                          <div className="song-info-box">
                            <div className="circle"></div>
                            <div className="song-text">
                              <p className="song-title">Levitating</p>
                              <p className="song-artist">Dua Lipa</p>
                              <p className="song-genre">Dance</p>
                            </div>
                          </div>
                          <div className="song-info-box">
                            <div className="circle"></div>
                            <div className="song-text">
                              <p className="song-title">Levitating</p>
                              <p className="song-artist">Dua Lipa</p>
                              <p className="song-genre">Dance</p>
                            </div>
                          </div>
                          <div className="song-info-box">
                            <div className="circle"></div>
                            <div className="song-text">
                              <p className="song-title">Levitating</p>
                              <p className="song-artist">Dua Lipa</p>
                              <p className="song-genre">Dance</p>
                            </div>
                          </div>
                          <div className="song-info-box">
                            <div className="circle"></div>
                            <div className="song-text">
                              <p className="song-title">Levitating</p>
                              <p className="song-artist">Dua Lipa</p>
                              <p className="song-genre">Dance</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </section>

        </div>
        <div className="scroll-section">
            <section className="home-featured">
                      <h2>Recent Statistics</h2>
                      <p className="featured-stat-heading">Average Track Length:</p>
                      <p className="featured-stat-heading"></p>
                      <p className="featured-stat-heading">Total Hours:</p>
                      <p className="featured-stat-heading"></p>
                      <p className="featured-stat-heading">Total Minutes:</p>
                      <p className="featured-stat-heading"></p>
                      <p className="featured-stat-heading">Total Plays:</p>
                      <p className="featured-stat-heading"></p>
                    </section>

        </div>
      </div>
    </div>
  );
};

export default HomeMobile;
