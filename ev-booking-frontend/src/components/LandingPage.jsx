import { Link } from 'react-router-dom';

const LandingPage = () => {
    return (
        <div>
            <h1 className="text-5xl font-bold text-gray-800 mb-6">
                🚗 EVynk
            </h1>
            <p className="text-xl text-gray-600 mb-8">
                Manage your electric vehicle charging stations and bookings with ease
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="bg-blue-50 p-6 rounded-lg">
                    <h3 className="text-lg font-semibold text-blue-800 mb-2">Backoffice</h3>
                    <p className="text-blue-600 mb-4">Manage users, stations, and system settings</p>
                    <Link
                        to="/login"
                        className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg transition duration-300 inline-block"
                    >
                        Admin Login
                    </Link>
                </div>

                <div className="bg-green-50 p-6 rounded-lg">
                    <h3 className="text-lg font-semibold text-green-800 mb-2">Station Operator</h3>
                    <p className="text-green-600 mb-4">Monitor and manage charging stations</p>
                    <Link
                        to="/login"
                        className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-lg transition duration-300 inline-block"
                    >
                        Operator Login
                    </Link>
                </div>
            </div>

            <div className="text-center">
                <p className="text-gray-600 mb-4">Don't have an account?</p>
                <Link
                    to="/register"
                    className="text-blue-500 hover:text-blue-600 font-medium"
                >
                    Sign up here
                </Link>
            </div>
        </div>
    );
};

export default LandingPage;
