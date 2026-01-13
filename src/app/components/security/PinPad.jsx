import { useState, useEffect } from 'react';
import { Delete, X } from 'lucide-react';
import { useSecurity } from '../../context/SecurityContext';

export function PinPad({ onClose, isSettingUp = false, onPinSet, onSuccess }) {
    const { verifyPin } = useSecurity();
    const [pin, setPin] = useState('');
    const [error, setError] = useState(false);
    const [step, setStep] = useState(isSettingUp ? 'create' : 'verify'); // create, confirm, verify
    const [tempPin, setTempPin] = useState(null);

    const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, '', 0, 'del'];

    useEffect(() => {
        if (pin.length === 4) {
            handleComplete(pin);
        }
    }, [pin]);

    const handleComplete = (input) => {
        if (isSettingUp) {
            if (step === 'create') {
                setTempPin(input);
                setPin('');
                setStep('confirm');
            } else if (step === 'confirm') {
                if (input === tempPin) {
                    if (onPinSet) onPinSet(input);
                } else {
                    setError(true);
                    setTimeout(() => {
                        setPin('');
                        setError(false);
                    }, 500);
                }
            }
        } else {
            // Verify Mode
            const isValid = verifyPin(input);
            if (isValid) {
                // Success handled by context (unlocks app)
                if (onSuccess) onSuccess();
            } else {
                setError(true);
                setTimeout(() => {
                    setPin('');
                    setError(false);
                }, 500);
            }
        }
    };

    const handlePress = (val) => {
        if (val === 'del') {
            setPin(prev => prev.slice(0, -1));
            return;
        }
        if (pin.length < 4) {
            setPin(prev => prev + val);
        }
    };
    
    return (
        <div className="flex flex-col items-center justify-center w-full max-w-sm mx-auto p-4 animate-in fade-in zoom-in-95 duration-300">
            <div className="mb-12 text-center space-y-2">
                <h3 className="text-xl font-medium" style={{ color: 'var(--foreground)' }}>
                    {isSettingUp 
                        ? (step === 'create' ? 'Create PIN' : 'Confirm PIN')
                        : 'Enter PIN'}
                </h3>
                <div className="flex gap-4 justify-center">
                    {[0, 1, 2, 3].map(i => (
                        <div 
                            key={i} 
                            className={`w-4 h-4 rounded-full transition-all duration-200 ${
                                i < pin.length 
                                    ? (error ? 'bg-red-500 scale-110' : 'scale-100') 
                                    : ''
                            }`}
                            style={{ 
                                backgroundColor: i < pin.length && !error ? 'var(--foreground)' : undefined,
                                border: i < pin.length ? 'none' : '2px solid var(--card-border)' 
                            }}
                        />
                    ))}
                </div>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-3 gap-x-8 gap-y-4 w-full max-w-[260px]">
                {numbers.map((num, idx) => {
                    if (num === '') return <div key={idx} />;
                    
                    const isDel = num === 'del';
                    return (
                        <button
                            key={idx}
                            onClick={() => handlePress(num)}
                            className="w-14 h-14 rounded-full flex items-center justify-center text-2xl font-normal transition-all outline-none focus:outline-none hover:bg-black/5 dark:hover:bg-white/10 active:scale-95"
                            style={{ color: 'var(--foreground)' }}
                        >
                            {isDel ? <Delete className="w-6 h-6 opacity-50" /> : num}
                        </button>
                    );
                })}
            </div>
            
            {onClose && (
                <button onClick={onClose} className="mt-12 text-sm text-gray-400 font-medium hover:text-gray-600">
                    Cancel
                </button>
            )}
        </div>
    );
}
