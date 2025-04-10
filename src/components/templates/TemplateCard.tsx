import React from 'react';
import { 
  Card, 
  CardContent, 
  CardMedia, 
  Typography, 
  Box, 
  Chip, 
  IconButton,
  Tooltip,
  CardActionArea
} from '@mui/material';
import { 
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon,
  Comment as CommentIcon,
  Description as DescriptionIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';
import { Template } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import * as likesApi from '../../api/likes';

interface TemplateCardProps {
  template: Template;
  onLike?: (templateId: string) => void;
}

const TemplateCard: React.FC<TemplateCardProps> = ({ template, onLike }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { authState } = useAuth();
  const [liked, setLiked] = React.useState(false);
  const [likesCount, setLikesCount] = React.useState(template.likesCount);
  
  React.useEffect(() => {
    if (authState.isAuthenticated) {
      const checkLikeStatus = async () => {
        try {
          const hasLiked = await likesApi.getLikeStatus(template.id);
          setLiked(hasLiked);
        } catch (error) {
          console.error('Error checking like status:', error);
        }
      };
      
      checkLikeStatus();
    }
  }, [template.id, authState.isAuthenticated]);
  
  const handleLike = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!authState.isAuthenticated) {
      navigate('/login');
      return;
    }
    
    try {
      if (liked) {
        await likesApi.unlikeTemplate(template.id);
        setLiked(false);
        setLikesCount(prev => prev - 1);
      } else {
        await likesApi.likeTemplate(template.id);
        setLiked(true);
        setLikesCount(prev => prev + 1);
      }
      
      if (onLike) {
        onLike(template.id);
      }
    } catch (error) {
      console.error('Error liking template:', error);
    }
  };
  
  const handleCardClick = () => {
    navigate(`/templates/${template.id}`);
  };
  
  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardActionArea onClick={handleCardClick}>
        {template.imageUrl && (
          <CardMedia
            component="img"
            height="140"
            image={template.imageUrl}
            alt={template.title}
          />
        )}
        
        <CardContent sx={{ flexGrow: 1 }}>
          <Typography gutterBottom variant="h6" component="div" noWrap>
            {template.title}
          </Typography>
          
          <Typography variant="body2" color="text.secondary" sx={{
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            mb: 1
          }}>
            {template.description}
          </Typography>
          
          <Box display="flex" flexWrap="wrap" gap={0.5} mb={1}>
            {Array.isArray(template.tags) && template.tags.slice(0, 3).map(tag => (
              <Chip 
                key={tag} 
                label={tag} 
                size="small" 
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/tags/${tag}/templates`);
                }}
              />
            ))}
            {Array.isArray(template.tags) && template.tags.length > 3 && (
              <Chip 
                label={`+${template.tags.length - 3}`} 
                size="small" 
                variant="outlined"
              />
            )}
          </Box>
          
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="caption" color="text.secondary">
              {dayjs(template.createdAt).format('MMM D, YYYY')}
            </Typography>
            
            <Typography variant="caption" color="text.secondary">
              {t('by')} {template.creator.name}
            </Typography>
          </Box>
        </CardContent>
      </CardActionArea>
      
      <Box display="flex" justifyContent="space-between" alignItems="center" px={2} py={1}>
        <Box display="flex" alignItems="center">
          <Tooltip title={liked ? t('unlike') : t('like')}>
            <IconButton size="small" onClick={handleLike} color={liked ? 'error' : 'default'}>
              {liked ? <FavoriteIcon /> : <FavoriteBorderIcon />}
            </IconButton>
          </Tooltip>
          <Typography variant="body2" color="text.secondary" sx={{ ml: 0.5 }}>
            {likesCount}
          </Typography>
          
          <Tooltip title={t('comments')}>
            <IconButton size="small" sx={{ ml: 1 }}>
              <CommentIcon />
            </IconButton>
          </Tooltip>
          <Typography variant="body2" color="text.secondary" sx={{ ml: 0.5 }}>
            {template.commentsCount}
          </Typography>
        </Box>
        
        <Box display="flex" alignItems="center">
          <Tooltip title={t('forms')}>
            <IconButton size="small">
              <DescriptionIcon />
            </IconButton>
          </Tooltip>
          <Typography variant="body2" color="text.secondary" sx={{ ml: 0.5 }}>
            {template.formsCount}
          </Typography>
        </Box>
      </Box>
    </Card>
  );
};

export default TemplateCard;