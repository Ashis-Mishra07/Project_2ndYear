import { useDispatch, useSelector } from 'react-redux';
import { useRef, useState, useEffect } from 'react';
import {
    getDownloadURL,
    getStorage,
    ref,
    uploadBytesResumable,
} from 'firebase/storage';
import { app } from '../firebase';
import { updateUserStart, updateUserSuccess, updateUserFailure, deleteUserFailure,deleteUserStart,deleteUserSuccess, signOutUserStart } from '../redux/user/userSlice';

export default function Profile() {
    const fileRef = useRef(null);
    const { currentUser, loading, error } = useSelector((state) => state.user);
    const [file, setFile] = useState(undefined);
    const [filePerc, setFilePerc] = useState(0);
    const [fileUploadError, setFileUploadError] = useState(false);
    const [formData, setFormData] = useState({});
    const [updateSuccess, setUpdateSuccess] = useState(false);

    const dispatch = useDispatch();

    // firebase Storage
    // allow read;
    // allow write: if
    // request.resource.size < 2 * 1024 * 1024 &&
    // request.resource.contentType.matches('image/.*')

    useEffect(() => {
        if (file) {
            handleFileUpload(file);
        }
    }, [file]);

    const handleFileUpload = (file) => {
        const storage = getStorage(app);
        const fileName = new Date().getTime() + file.name;
        const storageRef = ref(storage, fileName);
        const uploadTask = uploadBytesResumable(storageRef, file);

        uploadTask.on(
            'state_changed',
            (snapshot) => {
                const progress =
                    (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                setFilePerc(Math.round(progress));
            },
            (error) => {
                setFileUploadError(true);
            },
            () => {
                getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) =>
                    setFormData({ ...formData, avatar: downloadURL })
                );
            }
        );
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.id]: e.target.value });
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            dispatch(updateUserStart());
            const res = await fetch(`/api/user/update/${currentUser._id}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });
            const data = await res.json();
            if (data.success === false) {
                dispatch(updateUserFailure(data.message));
                return;
            }

            dispatch(updateUserSuccess(data));
            setUpdateSuccess(true);
        } catch (error) {
            dispatch(updateUserFailure(error.message));
        }
    };

    const handleDeleteUser = async()=>{
        try{
            dispatch(deleteUserStart());
            const res = await fetch(`/api/user/delete/${currentUser._id}`, {
                method: 'DELETE',
            });
            const data = await res.json();
            if (data.success === false) {
                dispatch(deleteUserFailure(data.message));
                return;
            }

            dispatch(deleteUserSuccess(data));
        }
        catch(err){
            dispatch(deleteUserFailure(error.message));
        }
    }

    const handleSignOut=async()=>{
        try {
            dispatch(signOutUserStart());
            const res=await fetch('/api/auth/signout');
            const data=await res.json();
            if(data.success===false){
                dispatch(deleteUserFailure(data.message));
                return;
            }
            dispatch(deleteUserSuccess(data));
        } 
        catch (error) {
            dispatch(deleteUserFailure(error.message));
        }
    }

    return (
        <div className='p-3 max-w-lg mx-auto'>
            <h1 className='text-3xl font-semibold text-center my-4 '>Profile</h1>
            <form onSubmit={handleSubmit} className='flex flex-col gap-3.5' >
                <input type="file" onChange={(e) => setFile(e.target.files[0])} ref={fileRef} hidden accept='image/*' />
                <img onClick={() => fileRef.current.click()} src={formData.avatar || currentUser.avatar} alt="profile" className='rounded-full
                 h-40 w-40 object-cover  cursor-pointer self-center mt-1' />

                <p className='text-lg self-center '>
                    {fileUploadError ? (
                        <span className='text-red-900 font-bold'>
                            Error Image upload (image must be less than 2 mb)
                        </span>
                    ) : filePerc > 0 && filePerc < 100 ? (
                        <span className='text-slate-900 font-medium'>{`Uploading ${filePerc}%`}</span>
                    ) : filePerc === 100 ? (
                        <span className='text-lime-900 font-medium'>Image successfully uploaded!</span>
                    ) : (
                        ''
                    )}
                </p>

                <input type="text" onChange={handleChange} defaultValue={currentUser.username} placeholder='Username' id='username' className='border p-3 rounded-lg' />
                <input type="email" onChange={handleChange} defaultValue={currentUser.email} placeholder='Email' id='email' className='border p-3 rounded-lg' />
                <input type="password" onChange={handleChange} placeholder='Password' id='password' className='border p-3 rounded-lg' />

                <button disabled={loading} className='bg-slate-700 text-white rounded-lg p-3
                 uppercase hover:opacity-95 disabled:opacity-80'>{loading ? 'Loading...' : 'Update'}</button>

            </form>

            <div className='flex justify-between mt-5'>
                <span onClick={handleDeleteUser} className='text-red-700 cursor-pointer font-semibold text-lg'> Delete Account</span>
                <span onClick={handleSignOut} className='text-red-700 cursor-pointer font-semibold text-lg'> Sign Out</span>
            </div>
            <p className='text-red-700 mt-5'>{error ? error : ''}</p>
            <p className='text-green-600 mt-5 font-semibold text-lg '>{updateSuccess ? 'User is updated successfully!' : ''}</p>
        </div>
    )
}
