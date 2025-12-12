const Button = ({ children, onClick, variant = 'primary', type = 'button', disabled = false, className = '' }) => {
    const baseClasses = 'px-4 py-2 rounded font-medium transition-colors';

    const variantClasses = {
        primary: 'bg-primary hover:bg-secondary text-white',
        secondary: 'bg-gray-500 hover:bg-gray-600 text-white',
        danger: 'bg-red-500 hover:bg-red-600 text-white',
        success: 'bg-green-500 hover:bg-green-600 text-white'
    };

    const disabledClasses = 'opacity-50 cursor-not-allowed';

    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled}
            className={`${baseClasses} ${variantClasses[variant]} ${disabled ? disabledClasses : ''} ${className}`}
        >
            {children}
        </button>
    );
};

export default Button;
