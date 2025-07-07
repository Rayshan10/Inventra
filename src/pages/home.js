import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function Home() {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user'));

    useEffect(() => {
    if (!user) {
        navigate('/');
    }
    }, [user, navigate]);

    return (
    <div style={{ padding: 20 }}>
        <h2>Selamat datang, {user?.nama}</h2>
        <p>Ini adalah halaman home. Silakan tambahkan daftar barang di sini.</p>
    </div>
    );
}

export default Home;
