import { auth, db } from '/Proyecto/Secciones/Auth/persistencia.js'; 

// Función para verificar si el usuario está logueado
const checkUserAuth = async () => {
    const user = auth.currentUser;
    if (!user) {
        console.log('Usuario no logueado');
        return null;
    }
    return user;
}

// Función para obtener los datos del usuario (nombre y foto de perfil)
const getUserData = async (userId) => {
    const userRef = db.collection('users').doc(userId);
    const userDoc = await userRef.get();
    if (userDoc.exists) {
        return userDoc.data();
    }
    return null;
}

// Función para obtener las obras del usuario
const getArtworks = async () => {
    const user = await checkUserAuth();
    if (!user) return;

    // Obtener los datos del usuario
    const userData = await getUserData(user.uid);
    if (!userData) {
        console.log('No se pudo obtener los datos del usuario');
        return;
    }

    // Ahora que tenemos los datos del usuario, obtener las obras
    const artworksRef = db.collection('artworks');
    const snapshot = await artworksRef.get();
    const artworks = snapshot.docs.map(doc => doc.data());

    // Muestra las obras y los datos del usuario
    artworks.forEach(artwork => {
        console.log('Obra:', artwork.name);
        console.log('Descripción:', artwork.description);
        console.log('Foto:', artwork.photo);
        console.log('Lugar:', artwork.place);
        console.log('Categoría:', artwork.category);
        
        // Mostrar los datos del usuario en la obra
        console.log('Artista:', userData.name);
        console.log('Foto del artista:', userData.profileImage);
    });
}

// Llamar la función para obtener las obras
getArtworks();
