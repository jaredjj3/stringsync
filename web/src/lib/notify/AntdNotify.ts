import { message, Modal, ModalFuncProps, notification } from 'antd';
import { ArgsProps } from 'antd/lib/notification';
import { ReactNode } from 'react';
import { MessageConfig, ModalConfig, Notify, PopupConfig } from './types';

type AntdSendMessage = (content: ReactNode, duration?: number) => any;

type AntdMakePopup = (args: ArgsProps) => any;

type AntdShowModal = (props: ModalFuncProps) => any;

export class AntdNotify implements Notify {
  private static message = (sendMessage: AntdSendMessage) => (config: MessageConfig) => {
    sendMessage(config.content, config.duration?.sec);
  };

  private static popup = (makePopup: AntdMakePopup) => (config: PopupConfig) => {
    makePopup({
      message: config.title,
      description: config.content,
      placement: config.placement,
      closeIcon: config.closeIcon,
      btn: config.button,
      duration: config.duration?.sec,
    });
  };

  private static modal = (showModal: AntdShowModal) => (config: ModalConfig) => {
    showModal({
      title: config.title,
      content: config.content,
      maskClosable: true,
    });
  };

  message = {
    info: AntdNotify.message(message.info),
    success: AntdNotify.message(message.success),
    warn: AntdNotify.message(message.warn),
    error: AntdNotify.message(message.error),
  };
  popup = {
    info: AntdNotify.popup(notification.info),
    success: AntdNotify.popup(notification.success),
    warn: AntdNotify.popup(notification.warn),
    error: AntdNotify.popup(notification.error),
  };
  modal = {
    info: AntdNotify.modal(Modal.info),
    success: AntdNotify.modal(Modal.success),
    warn: AntdNotify.modal(Modal.warn),
    error: AntdNotify.modal(Modal.error),
  };
}
