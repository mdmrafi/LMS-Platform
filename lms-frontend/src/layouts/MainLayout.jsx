import Navbar from './Navbar';

const MainLayout = ({ children, user, setUser }) => {
    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar user={user} setUser={setUser} />
            <main>{children}</main>
        </div>
    );
};

export default MainLayout;
