import * as signalR from '@microsoft/signalr';
import { Comment } from '../types';

const API_URL = 'https://localhost:7236';

let connection: signalR.HubConnection | null = null;

export const startConnection = async () => {
  connection = new signalR.HubConnectionBuilder()
    .withUrl(`${API_URL}/hubs/comments`)
    .withAutomaticReconnect()
    .build();

  try {
    await connection.start();
    console.log('SignalR Connected');
  } catch (err) {
    console.error('SignalR Connection Error: ', err);
  }
};

export const stopConnection = async () => {
  if (connection) {
    try {
      await connection.stop();
      console.log('SignalR Disconnected');
    } catch (err) {
      console.error('SignalR Disconnection Error: ', err);
    }
  }
};

export const joinTemplateGroup = async (templateId: string) => {
  if (connection) {
    try {
      await connection.invoke('JoinTemplateGroup', templateId);
      console.log(`Joined template group: ${templateId}`);
    } catch (err) {
      console.error('Error joining template group: ', err);
    }
  }
};

export const leaveTemplateGroup = async (templateId: string) => {
  if (connection) {
    try {
      await connection.invoke('LeaveTemplateGroup', templateId);
      console.log(`Left template group: ${templateId}`);
    } catch (err) {
      console.error('Error leaving template group: ', err);
    }
  }
};

export const onReceiveComment = (callback: (comment: Comment) => void) => {
  if (connection) {
    connection.on('ReceiveComment', callback);
  }
};

export const onUpdateComment = (callback: (comment: Comment) => void) => {
  if (connection) {
    connection.on('UpdateComment', callback);
  }
};

export const onDeleteComment = (callback: (commentId: string) => void) => {
  if (connection) {
    connection.on('DeleteComment', callback);
  }
};

export const onUpdateLikes = (callback: (likesCount: number) => void) => {
  if (connection) {
    connection.on('UpdateLikes', callback);
  }
};

export const removeAllListeners = () => {
  if (connection) {
    connection.off('ReceiveComment');
    connection.off('UpdateComment');
    connection.off('DeleteComment');
    connection.off('UpdateLikes');
  }
};