import React, { useState, useEffect } from "react";
import { X, MapPin, Camera, Clock, CheckCircle2, AlertCircle } from "lucide-react";
import { shiftService } from "../../services/scheduleApi";

const CheckInProofModal = ({ accountId, shift, onClose }) => {
  const [checkIn, setCheckIn] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadProof();
  }, []);

  const loadProof = async () => {
    try {
      const res = await shiftService.getCheckIn(accountId, shift._id);
      setCheckIn(res.data);
    } catch (err) {
      setError("No check-in record found for this shift.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[140] bg-gray-900/60 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in duration-200">
        <div className="p-8 pb-4 flex items-center justify-between">
           <h3 className="text-xl font-black text-gray-900">Verification Proof</h3>
           <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full text-gray-400">
             <X className="w-5 h-5" />
           </button>
        </div>

        <div className="p-8 pt-4">
          {loading ? (
             <div className="py-12 flex flex-col items-center gap-4">
                <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                <p className="text-gray-400 font-bold text-[10px] uppercase tracking-widest">Retrieving Evidence...</p>
             </div>
          ) : error ? (
             <div className="py-12 text-center">
                <AlertCircle className="w-12 h-12 text-orange-200 mx-auto mb-4" />
                <p className="text-gray-500 font-bold">{error}</p>
             </div>
          ) : (
             <div className="space-y-6">
                {/* Photo Proof */}
                <div className="relative group">
                   <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/60 to-transparent z-10 rounded-b-[2rem]">
                      <p className="text-[10px] font-black text-white/80 uppercase tracking-widest flex items-center gap-1.5">
                         <Camera className="w-3 h-3" /> Visual Evidence
                      </p>
                   </div>
                   <img 
                     src={checkIn.imageData} 
                     alt="Check-in proof"
                     className="w-full aspect-[4/3] object-cover rounded-[2rem] border-4 border-gray-50 shadow-inner bg-gray-100"
                   />
                </div>

                {/* Details */}
                <div className="grid grid-cols-2 gap-4">
                   <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                        <Clock className="w-3 h-3" /> Arrived At
                      </p>
                      <p className="text-sm font-black text-gray-900">
                         {new Date(checkIn.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                   </div>
                   <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3 h-3 text-green-500" /> Identity
                      </p>
                      <p className="text-sm font-black text-gray-900 truncate">
                         {checkIn.memberId?.displayName}
                      </p>
                   </div>
                </div>

                {/* Location Info */}
                <div className="p-5 bg-indigo-50/50 rounded-2xl border border-indigo-100 flex items-center gap-4">
                   <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-100">
                      <MapPin className="w-5 h-5" />
                   </div>
                   <div>
                      <p className="text-[10px] font-black text-indigo-400 uppercase tracking-wider">Device Coordinates</p>
                      <p className="text-xs font-black text-indigo-900 mt-0.5">
                         {checkIn.latitude.toFixed(6)}, {checkIn.longitude.toFixed(6)}
                      </p>
                      <a 
                        href={`https://www.google.com/maps?q=${checkIn.latitude},${checkIn.longitude}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[10px] font-bold text-indigo-600 hover:underline mt-1 inline-block"
                      >
                         Open in Google Maps →
                      </a>
                   </div>
                </div>

                <p className="text-[9px] text-center text-gray-300 font-black uppercase tracking-[0.3em] py-2">
                   End-to-End Verified
                </p>
             </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CheckInProofModal;
