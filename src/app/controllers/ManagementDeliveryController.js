import { isAfter, isBefore, setHours } from 'date-fns';

import Delivery from '../models/Delivery';

class ManagementDeliveryController {
  async update(req, res) {
    const { id } = req.params;

    const delivery = await Delivery.findByPk(id);

    if (!delivery) {
      return res.status(400).json({ error: 'Delivery does not exists' });
    }

    if (!delivery.start_date) {
      const startDate = new Date();
      if (
        isBefore(startDate, setHours(new Date(), 8)) ||
        isAfter(startDate, setHours(new Date(), 18))
      ) {
        return res.status(400).json({ error: 'Invalid time' });
      }

      delivery.start_date = startDate;
      await delivery.save();
      return res.json({ msg: 'Successful start Delivery', id });
    }
    if (!delivery.end_date) {
      delivery.end_date = new Date();
      await delivery.save();

      return res.json({ msg: 'Successful ended Delivery', id });
    }
    return res.json({ error: 'Error on update start/end delivery' });
  }
}

export default new ManagementDeliveryController();
