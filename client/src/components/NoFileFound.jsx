import folderImage from '../assets/folder-removebg-preview.png'

function NoFileFound({message}) {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', height: '40vh' }}>
            <img src={folderImage} alt="Image" />
            <h3>{message}</h3>
        </div>
    );
}


export default NoFileFound; 