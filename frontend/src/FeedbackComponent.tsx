import { useState, useEffect } from 'react';

export default function FeedbackComponent() {
  const [feedbacks, setFeedbacks] = useState([]);
  const [comment, setComment] = useState('');
  const [rating, setRating] = useState(5);
  const [hoveredStar, setHoveredStar] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchFeedbacks = () => {
    fetch('http://127.0.0.1:8000/api/feedback/')
      .then(res => res.json())
      .then(data => setFeedbacks(data))
      .catch(err => console.error(err));
  };

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  const handleSubmit = (e: any) => {
    e.preventDefault();
    if (!comment.trim() || rating === 0) return;
    
    setIsSubmitting(true);
    fetch('http://127.0.0.1:8000/api/feedback/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ comment, rating })
    })
      .then(res => res.json())
      .then(() => {
        setComment('');
        setRating(5);
        fetchFeedbacks();
      })
      .catch(err => console.error(err))
      .finally(() => setIsSubmitting(false));
  };

  return (
    <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-purple-50 mt-8">
      <h2 className="text-2xl font-black mb-6 text-dark flex items-center gap-3">
        <span className="bg-purple-100 p-2 rounded-xl text-primary">⭐</span> Müşteri Değerlendirmeleri
      </h2>

      {/* Form */}
      <form onSubmit={handleSubmit} className="mb-8 bg-gradient-to-br from-purple-50 to-white p-6 rounded-3xl border border-purple-100 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl"></div>
        <h3 className="text-lg font-bold text-dark mb-4 relative z-10">Görüşlerinizi Paylaşın</h3>
        
        <div className="mb-4 relative z-10">
          <label className="block text-sm font-bold text-gray-500 mb-2">Puanınız</label>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                className="text-3xl transition-transform hover:scale-125 focus:outline-none"
                onMouseEnter={() => setHoveredStar(star)}
                onMouseLeave={() => setHoveredStar(0)}
                onClick={() => setRating(star)}
              >
                <span className={`transition-colors duration-300 ${(hoveredStar || rating) >= star ? 'text-yellow-400 drop-shadow-md' : 'text-gray-300'}`}>
                  ★
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="mb-4 relative z-10">
          <label className="block text-sm font-bold text-gray-500 mb-2">Yorumunuz</label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="w-full p-4 rounded-2xl border-2 border-purple-100 focus:border-primary focus:ring-4 focus:ring-primary/20 outline-none transition-all resize-none bg-white shadow-inner"
            rows={3}
            placeholder="Ürünlerimiz veya hizmetlerimiz hakkında ne düşünüyorsunuz?"
            required
          ></textarea>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="relative z-10 bg-primary text-white font-black py-3 px-8 rounded-2xl hover:bg-dark transition-all transform hover:-translate-y-1 shadow-lg shadow-primary/30 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'GÖNDERİLİYOR...' : 'DEĞERLENDİRMEYİ GÖNDER'}
        </button>
      </form>

      {/* Yorumlar Listesi */}
      <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
        {feedbacks.length > 0 ? feedbacks.map((fb: any) => (
          <div key={fb.id} className="p-5 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow group">
            <div className="flex justify-between items-start mb-2">
              <div className="flex gap-1 text-yellow-400 text-sm">
                {[1, 2, 3, 4, 5].map(star => (
                  <span key={star} className={star <= fb.rating ? 'opacity-100' : 'opacity-20 text-gray-400'}>★</span>
                ))}
              </div>
              <span className="text-xs text-gray-400 font-medium">
                {new Date(fb.created_at).toLocaleDateString('tr-TR')}
              </span>
            </div>
            <p className="text-gray-600 text-sm leading-relaxed">{fb.comment}</p>
          </div>
        )) : (
          <div className="text-center py-8 text-gray-400 italic">Henüz bir değerlendirme yapılmamış. İlk değerlendiren siz olun!</div>
        )}
      </div>
    </div>
  );
}
