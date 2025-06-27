import type { AxiosError, AxiosResponse } from 'axios';
import type { QNotifyCreateOptions } from 'quasar';

import { Notify as QuasarNotify } from 'quasar';

import { iconCached, iconCheck, iconError, iconInfo, iconWarning } from '@/icons';

type StatusMap = { [key: number]: string };

class Notify {
  create(opts: QNotifyCreateOptions): void {
    QuasarNotify.create({
      ...opts,
      position: 'bottom',
    });
  }

  apiError(error: AxiosError): void {
    const res: AxiosResponse | undefined = error.response;

    if (res == undefined) return;

    const types: StatusMap = {
      400: 'warning',
      401: 'warning',
      403: 'warning',
      500: 'negative',
    };

    const textColors: StatusMap = {
      400: 'grey-8',
      401: 'grey-8',
      403: 'grey-8',
      500: 'white',
    };

    const type = types[res.status] || 'warning';
    const caption = `${res.status} ${res.statusText}`.toUpperCase() || '';
    let msg = '';

    // 400 Bad Request || 403 Forbidden
    if (res.status == 400 || res.status == 403) {
      const errors: string[] = [];
      Object.keys(res.data).forEach((k) => {
        if (typeof res.data[k] == 'string') {
          errors.push(`<strong>${k}</strong>: ${res.data[k]}`);
        } else {
          res.data[k].forEach((v: string) => {
            errors.push(`<strong>${k}</strong>: ${v}`);
          });
        }
      });
      msg = errors.join('<br>') || '';
    }

    // 500 Internal Server Error
    if (res.status == 500) {
      msg = res.data.detail || '';
    }

    this.create({
      timeout: 10000,
      progress: true,
      html: true,
      message: msg,
      caption: caption,
      type: type,
      icon: type == 'negative' ? iconError : iconWarning,
      actions: [
        {
          label: '✕',
          color: textColors[res.status] || 'grey-8',
        },
      ],
      attrs: {
        role: 'alert',
      },
    });
  }

  error(msg: string): void {
    this.create({
      type: 'negative',
      message: msg,
      timeout: 5000,
      icon: iconError,
    });
  }

  info(msg: string): void {
    this.create({
      message: msg,
      timeout: 2500,
      icon: iconInfo,
    });
  }

  ongoing(msg: string, timeout: number): void {
    this.create({
      type: 'ongoing',
      message: msg,
      timeout: timeout,
      spinner: false,
      progress: true,
    });
  }

  success(msg: string): void {
    this.create({
      type: 'positive',
      message: msg,
      timeout: 2500,
      icon: iconCheck,
    });
  }

  warning(msg: string): void {
    this.create({
      type: 'warning',
      message: msg,
      timeout: 5000,
      icon: iconWarning,
    });
  }

  reload(): void {
    this.create({
      color: 'dark',
      icon: iconCached,
      message: 'We have updated the website. Please refresh the page.',
      timeout: 0,
      multiLine: true,
      position: 'bottom',
      actions: [
        {
          label: 'Refresh',
          color: 'lime',
          handler: () => {
            window.location.reload();
          },
        },
      ],
    });
  }
}

export const notify = new Notify();
