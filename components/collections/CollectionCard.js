import { Card, CardActionArea, CardContent, CardMedia, Typography } from "@mui/material"
import Link from 'next/link';
export default function CollectionCard ({ collection }){
    const fallBackImage = process.env.NEXT_PUBLIC_IMAGE_404
    const { id, name, description, bannerUri, collectionAddress, owner, collectionType } = collection
    
    const descString = description.length > 90 ? description.substring(0, 90) + "..." : description
    
    const onImageError = ({ currentTarget }) => {
        currentTarget.onerror = null
        currentTarget.src = fallBackImage
    }
    return <Link href={`/collections/${id}?type=${collectionType}`} passHref>
        <Card>
            <CardActionArea>
                <CardMedia height="340" component="img" image={bannerUri} onError={onImageError}/>
                <CardContent sx={{ height: '70px' }}>
                    <Typography variant="h5">
                        {name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        {descString}
                    </Typography>
                </CardContent>
            </CardActionArea>
        </Card>
    </Link>


}