import { isAfter, isBefore, setHours } from 'date-fns';

import Delivery from '../models/Delivery';

class ControlDeliveryController {
  async finishDelivery(req, res) {
    const { id } = req.params;

    const delivery = await Delivery.findByPk(id);

    if (!delivery) {
      return res.status(400).json({ error: 'Delivery does not exists' });
    }

    delivery.end_date = new Date();

    await delivery.save();

    return res.json({ msg: 'Successful Delivery', id });
  }

  async withdrawDelivery(req, res) {
    const { id } = req.params;

    const delivery = await Delivery.findByPk(id);

    if (!delivery) {
      return res.status(400).json({ error: 'Delivery does not exists' });
    }

    const startDate = new Date();
    if (
      isBefore(startDate, setHours(new Date(), 8)) ||
      isAfter(startDate, setHours(new Date(), 18))
    ) {
      return res.status(400).json({ error: 'Invalid time' });
    }

    delivery.start_date = startDate;

    await delivery.save();

    return res.json({ msg: 'Successful Delivery', id });
  }
}

export default new ControlDeliveryController();
