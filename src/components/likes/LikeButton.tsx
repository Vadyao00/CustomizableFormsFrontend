import React, { useState, useEffect } from 'react';
import { 
  IconButton, 
  Typography, 
  Box, 
  Tooltip 
} from '@mui/material';
import { 
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';
import * as likesApi from '../../api/likes';
import { useLikes } from '../../contexts/LikesContext';

interface LikeButtonProps {
  templateId: string;
  showCount?: boolean;
  size?: 'small' | 'medium' | 'large';
  onLikeToggle?: (liked: boolean) => void;
}

const LikeButton: React.FC<LikeButtonProps> = ({ 
  templateId, 
  showCount = true, 
  size = 'small',
  onLikeToggle
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { authState } = useAuth();
  const { likesCount, updateLikesCount } = useLikes();
  
  const [liked, setLiked] = useState(false);
  const [initialized, setInitialized] = useState(false);
  
  useEffect(() => {
    const fetchLikesData = async () => {
      try {
        const count = await likesApi.getLikesCount(templateId);
        updateLikesCount(templateId, count);
        
        if (authState.isAuthenticated) {
          const hasLiked = await likesApi.getLikeStatus(templateId);
          setLiked(hasLiked);
        }
        
        setInitialized(true);
      } catch (error) {
        console.error('Error fetching likes data:', error);
      }
    };
    
    fetchLikesData();
  }, [templateId, authState.isAuthenticated, updateLikesCount]);
  
  const handleLikeToggle = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!authState.isAuthenticated) {
      navigate('/login');
      return;
    }
    
    try {
      if (liked) {
        await likesApi.unlikeTemplate(templateId);
        setLiked(false);
      } else {
        await likesApi.likeTemplate(templateId);
        setLiked(true);
      }
      
      if (onLikeToggle) {
        onLikeToggle(!liked);
      }
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };
  
  const count = likesCount[templateId] || 0;
  
  return (
    <Box display="flex" alignItems="center">
      <Tooltip title={liked ? t('tooltip.unlike') : t('tooltip.like')}>
        <IconButton 
          size={size} 
          onClick={handleLikeToggle} 
          color={liked ? 'error' : 'default'}
        >
          {liked ? <FavoriteIcon /> : <FavoriteBorderIcon />}
        </IconButton>
      </Tooltip>
      
      {showCount && (
        <Typography variant="body2" color="text.secondary" sx={{ ml: 0.5 }}>
          {count}
        </Typography>
      )}
    </Box>
  );
};

export default LikeButton;