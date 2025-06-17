import React, { useState, useEffect, useCallback } from 'react';
import './App.css'; // Import your CSS file

// --- Mock Data to Simulate API Responses ---
const mockTrendingSongs = [
  { id: 't1', title: 'Cosmic Voyage', artist: 'Star Traveler', genre: 'Electronic', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3' },
  { id: 't2', title: 'Ocean Breeze', artist: 'Wave Rider', genre: 'Chillout', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3' },
  { id: 't3', title: 'Street Lights', artist: 'Urban Soundscapes', genre: 'Hip Hop', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3' },
  { id: 't4', title: 'Whispering Winds', artist: 'Ethereal Harmonies', genre: 'Ambient', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3' },
  { id: 't5', title: 'Rhythmic Pulse', artist: 'Groove Machine', genre: 'Electronic', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3' },
];

const mockUserHistorySongs = [
  { id: 'h1', title: 'Summer Anthem', artist: 'Beach Bums', genre: 'Pop', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3' },
  { id: 'h2', title: 'Rainy Day Blues', artist: 'Blues Brothers', genre: 'Blues', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3' },
  { id: 'h3', title: 'Jazz Club Vibe', artist: 'Smooth Notes', genre: 'Jazz', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3' },
  { id: 'h4', title: 'Mountain Echo', artist: 'Folk Wanderers', genre: 'Folk', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3' },
  { id: 'h5', title: 'Epic Journey', artist: 'Cinematic Orchestra', genre: 'Classical', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-10.mp3' },
];

const allMockSongs = [
  ...mockTrendingSongs,
  ...mockUserHistorySongs,
  { id: 's11', title: 'Late Night Drive', artist: 'Neon Dreams', genre: 'Synthwave', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3' },
  { id: 's12', title: 'Morning Coffee', artist: 'Acoustic Soul', genre: 'Acoustic', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3' },
  { id: 's13', title: 'Festival Groove', artist: 'Dance Collective', genre: 'Electronic', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3' },
  { id: 's14', title: 'Workout Jam', artist: 'Fitness Beats', genre: 'Pop', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3' },
  { id: 's15', title: 'Study Focus', artist: 'Calm Waves', genre: 'Ambient', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3' },
];

let audio = new Audio();

function App() {
  const [currentSong, setCurrentSong] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [likedSongs, setLikedSongs] = useState([]);
  const [recommendedSongs, setRecommendedSongs] = useState([]);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [trendingSongs, setTrendingSongs] = useState([]);
  const [userHistory, setUserHistory] = useState([]);

  const simulateApiCall = useCallback(async (endpoint) => {
    return new Promise(resolve => {
      setTimeout(() => {
        if (endpoint === '/api/trending-songs') {
          resolve(mockTrendingSongs);
        } else if (endpoint === '/api/user-history') {
          resolve(mockUserHistorySongs);
        } else {
          resolve([]);
        }
      }, 1500);
    });
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const fetchedTrending = await simulateApiCall('/api/trending-songs');
        setTrendingSongs(fetchedTrending);

        const fetchedHistory = await simulateApiCall('/api/user-history');
        setUserHistory(fetchedHistory);
        setLikedSongs(fetchedHistory);

      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [simulateApiCall]);

  const playSong = useCallback((song) => {
    if (currentSong && currentSong.id === song.id && isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.src = song.url;
      audio.play();
      setCurrentSong(song);
      setIsPlaying(true);
    }
  }, [currentSong, isPlaying]);

  const pauseSong = useCallback(() => {
    audio.pause();
    setIsPlaying(false);
  }, []);

  const togglePlayPause = useCallback(() => {
    if (isPlaying) {
      pauseSong();
    } else if (currentSong) {
      audio.play();
      setIsPlaying(true);
    }
  }, [isPlaying, currentSong, pauseSong]);

  const handleLikeSong = useCallback((song) => {
    setLikedSongs((prevLiked) => {
      if (!prevLiked.some((s) => s.id === song.id)) {
        return [...prevLiked, song];
      }
      return prevLiked;
    });
    console.log(`User liked song: ${song.title}`);
  }, []);

  const generateRecommendations = useCallback(() => {
    if (likedSongs.length === 0) {
      const uniqueTrending = trendingSongs.filter(ts => !allMockSongs.some(ams => ams.id === ts.id));
      setRecommendedSongs(uniqueTrending.slice(0, 5));
      return;
    }

    const likedGenres = new Set(likedSongs.map((song) => song.genre));

    const newRecommendations = allMockSongs.filter((song) =>
      !likedSongs.some(s => s.id === song.id) &&
      likedGenres.has(song.genre)
    );

    if (newRecommendations.length < 5) {
      const fillers = allMockSongs.filter(song =>
        !likedSongs.some(s => s.id === song.id) &&
        !newRecommendations.some(s => s.id === song.id)
      ).slice(0, 5 - newRecommendations.length);
      setRecommendedSongs([...newRecommendations, ...fillers]);
    } else {
      setRecommendedSongs(newRecommendations.slice(0, 5));
    }
  }, [likedSongs, trendingSongs]);

  useEffect(() => {
    if (!isLoading) {
      generateRecommendations();
    }
  }, [likedSongs, trendingSongs, isLoading, generateRecommendations]);

  useEffect(() => {
    const updateProgress = () => {
      if (audio.duration) {
        setProgress((audio.currentTime / audio.duration) * 100);
      }
    };

    const setSongDuration = () => {
      setDuration(audio.duration);
    };

    const handleSongEnd = () => {
      setIsPlaying(false);
      setProgress(0);
    };

    audio.addEventListener('timeupdate', updateProgress);
    audio.addEventListener('loadedmetadata', setSongDuration);
    audio.addEventListener('ended', handleSongEnd);

    return () => {
      audio.removeEventListener('timeupdate', updateProgress);
      audio.removeEventListener('loadedmetadata', setSongDuration);
      audio.removeEventListener('ended', handleSongEnd);
    };
  }, []);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // Function to export liked songs to a text file
  const exportLikedSongs = () => {
    if (likedSongs.length === 0) {
      console.log("No liked songs to export.");
      return;
    }

    const fileContent = likedSongs.map(song => `${song.title} - ${song.artist} (${song.genre})`).join('\n');
    const blob = new Blob([fileContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'liked_songs.txt';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <div className="loading-text">Loading Music Data...</div>
      </div>
    );
  }

  return (
    <div className="app-container">
      <h1 className="app-title">
        Harmonium
      </h1>

      <div className="main-content-area">
        {/* Music Player Section */}
        <div className="music-player-section">
          <h2 className="section-title">Now Playing</h2>
          {currentSong ? (
            <div className="player-content">
              <div className="album-art-container">
                <img
                  src={`https://placehold.co/256x256/3B0764/F3E8FF?text=${currentSong.title.replace(/\s/g, '+')}`}
                  alt="Album Art"
                  className="album-art"
                  onError={(e) => { e.target.onerror = null; e.target.src="https://placehold.co/256x256/3B0764/F3E8FF?text=No+Image"; }}
                />
              </div>
              <h3 className="song-title">{currentSong.title}</h3>
              <p className="song-artist-genre">{currentSong.artist} - {currentSong.genre}</p>

              <div className="progress-bar-container">
                <div
                  className="progress-bar"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <div className="time-display">
                <span>{formatTime(audio.currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>

              <div className="player-controls">
                <button
                  onClick={togglePlayPause}
                  className="control-button play-pause-button"
                  aria-label={isPlaying ? "Pause" : "Play"}
                >
                  {isPlaying ? (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                    </svg>
                  )}
                </button>
                <button
                  onClick={() => handleLikeSong(currentSong)}
                  className={`control-button like-button ${likedSongs.some(s => s.id === currentSong.id) ? 'liked' : ''}`}
                  aria-label="Like song"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                    </svg>
                </button>
              </div>
            </div>
          ) : (
            <p className="no-song-selected">Select a song from the list to start playing!</p>
          )}
        </div>

        {/* Song List & Recommendations Section */}
        <div className="song-lists-container">
          {/* User History/Liked Songs Section */}
          <div className="song-list-section">
            <h2 className="section-title">Your Liked Songs</h2>
            {userHistory.length > 0 ? (
              <div className="song-grid">
                {userHistory.map((song) => (
                  <div
                    key={song.id}
                    className="song-list-item"
                    onClick={() => playSong(song)}
                  >
                    <div>
                      <p className="item-title">{song.title}</p>
                      <p className="item-artist">{song.artist}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="no-songs-message">No liked songs yet. Like some to see them here!</p>
            )}
            {likedSongs.length > 0 && (
              <button
                onClick={exportLikedSongs}
                className="export-button"
              >
                Export Liked Songs (.txt)
              </button>
            )}
          </div>

          {/* All Songs / Trending Songs Section */}
          <div className="song-list-section">
            <h2 className="section-title">All Songs & Trending</h2>
            <div className="song-grid">
              {[...new Set([...allMockSongs, ...trendingSongs].map(s => JSON.stringify(s)))].map(s => JSON.parse(s)).map((song) => (
                <div
                  key={song.id}
                  className={`song-list-item ${currentSong && currentSong.id === song.id ? 'current-song' : ''}`}
                  onClick={() => playSong(song)}
                >
                  <div>
                    <p className="item-title">{song.title}</p>
                    <p className="item-artist">{song.artist}</p>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleLikeSong(song); }}
                    className={`like-toggle-button ${likedSongs.some(s => s.id === song.id) ? 'liked' : ''}`}
                    aria-label="Like song"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Recommended Songs */}
          <div className="song-list-section">
            <h2 className="section-title">Recommended For You</h2>
            {recommendedSongs.length > 0 ? (
              <div className="song-grid">
                {recommendedSongs.map((song) => (
                  <div
                    key={song.id}
                    className="song-list-item"
                    onClick={() => playSong(song)}
                  >
                    <div>
                      <p className="item-title">{song.title}</p>
                      <p className="item-artist">{song.artist}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="no-songs-message">Like some songs or wait for trending data to load to get personalized recommendations!</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
